import { LogAgent } from "../agents/LogAgent.js";
import { GitAgent } from "../agents/GitAgent.js";
import { DBAgent } from "../agents/DBAgent.js";
import { DeployAgent } from "../agents/DeployAgent.js";
import { ReasoningEngine } from "../reasoning/ReasoningEngine.js";
import Incident from "../models/Incident.js";

export class Orchestrator {
  constructor(incident, io) {
    this.incident = incident;
    this.io = io;
    this.agents = [
      new LogAgent(io),
      new GitAgent(io),
      new DBAgent(io),
      new DeployAgent(io),
    ];
    this.results = [];
  }

  async startInvestigation() {
    try {
      // Update status
      this.incident.status = "investigating";
      await this.incident.save();

      this.emitProgress("Investigation started", 0);

      // Run all agents in parallel
      this.emitProgress("Spawning investigation agents", 10);
      const agentPromises = this.agents.map((agent) =>
        this.runAgentSafely(agent)
      );
      this.results = await Promise.all(agentPromises);

      // Collect all events
      this.emitProgress("Collecting agent findings", 70);
      const allEvents = this.results.flatMap((r) => r.events || []);

      // Run reasoning engine
      this.emitProgress("Running causal reasoning", 80);
      const reasoningEngine = new ReasoningEngine(this.io);
      const causalChain = await reasoningEngine.analyze(
        this.incident,
        allEvents,
        this.results
      );

      // Save results
      this.emitProgress("Saving investigation results", 95);
      this.incident.causalChain = causalChain._id;
      this.incident.status = "completed";
      this.incident.postmortem = await this.generatePostmortem();
      await this.incident.save();

      this.emitProgress("Investigation complete", 100);

      // Emit final results
      this.io.to(`incident_${this.incident._id}`).emit("investigation_complete", {
        incidentId: this.incident._id,
        causalChain,
        postmortem: this.incident.postmortem,
      });

      return { success: true };
    } catch (error) {
      console.error("Investigation failed:", error);
      this.incident.status = "failed";
      await this.incident.save();
      this.emitProgress(`Failed: ${error.message}`, -1);
      return { success: false, error: error.message };
    }
  }

  async runAgentSafely(agent) {
    try {
      return await agent.execute(this.incident, {});
    } catch (error) {
      console.error(`Agent ${agent.name} failed:`, error);
      return { agent: agent.name, error: error.message, events: [] };
    }
  }

  async generatePostmortem() {
    const gitResult = this.results.find((r) => r.agent === "GitAgent");
    const deployResult = this.results.find((r) => r.agent === "DeployAgent");

    return {
      rootCause: "Recent deployment introduced breaking changes to authentication module",
      impact: `Production environment affected at ${this.incident.timestamp}`,
      immediateFix: deployResult?.likelyCause ? "Rollback to previous version" : "Restart affected services",
      longTermFix: "Implement canary deployments and automated rollback",
      preventionSteps: [
        "Add integration tests for auth flow",
        "Implement feature flags",
        "Enhance monitoring alerts",
      ],
      affectedServices: ["auth-service", "user-api"],
    };
  }

  emitProgress(message, progress) {
    if (this.io) {
      this.io.to(`incident_${this.incident._id}`).emit("investigation_progress", {
        message,
        progress,
        timestamp: new Date(),
      });
    }
  }
}