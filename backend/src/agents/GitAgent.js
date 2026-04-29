import { BaseAgent } from "./BaseAgent.js";

export class GitAgent extends BaseAgent {
    constructor(io) {
        super("Git Inspecter", "git", io);
    }

    async execute(incident, context) {
        await this.emitStatus(incident._id, "Checking recent commits", 10);

        const events = [];
        const incidentTime = new Date(incident.timestamp);

        const commits = [
            {
                title: "feat: Updated authentication module",
                description: "Refactored the authentication module to improve security and performance.",
                timestamp: new Date(incidentTime.getTime() - 10 * 60000),
                severity: "Warning",
                data: {hash: "a12b2c3d", files: ["auth.js", "userController.js"], author: "dev1"},
            },
            {
                title: "fix: Database connection fix",
                description: "Updated connection pool settings",
                timestamp: new Date(incidentTime.getTime() - 30 * 60000),
                severity: "info",
                data: { hash: "e4f5g6h", files: ["db.js"], author: "dev2" },
            },
        ];

        for (let i = 0; i < commits.length; i++) {
            const commit = commits[i];
            await this.emitStatus(
                incident._id,
                `Analyzing commit: ${commit.data.hash}`,
                30 + i  * 35
            );

            const event = await this.saveEvent(incident._id, commit);
            events.push(event);
        }

        await this.emitStatus(incident._id, "Git analysis completed", 100);

        return {
            agent: "GitAgent",
            events,
            summary: `Analyzed ${commits.length} commits around the incident time.`,
            riskAssessment: "medium",
        }
    }
}