import CausalChain from "../models/CausalChain.js";

export class ReasoningEngine {
  constructor(io) {
    this.io = io;
  }

  async analyze(incident, events, agentResults) {
    this.emitProgress("Aligning events chronologically", 20);

    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    this.emitProgress("Building dependency graph", 40);

    // Build nodes
    const nodes = sortedEvents.map((event, index) => ({
      eventId: event._id,
      description: event.title,
      confidence: 0.8,
      position: { x: index * 200, y: 100 },
    }));

    // Build edges (causal relationships)
    const edges = [];
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      for (let j = i + 1; j < sortedEvents.length; j++) {
        const timeDiff =
          new Date(sortedEvents[j].timestamp) - new Date(sortedEvents[i].timestamp);
        if (timeDiff < 300000) {
          // Within 5 minutes
          edges.push({
            from: sortedEvents[i]._id,
            to: sortedEvents[j]._id,
            relationship: "causes",
            strength: 0.7,
            reasoning: `Event occurs ${timeDiff / 1000}s after previous event`,
          });
        }
      }
    }

    this.emitProgress("Inferring causal relationships", 60);

    // Find root cause (earliest error)
    const errorEvents = sortedEvents.filter((e) => e.severity === "error");
    const rootEvent = errorEvents[0] || sortedEvents[0];

    this.emitProgress("Constructing causal chain", 80);

    const causalChain = new CausalChain({
      incidentId: incident._id,
      nodes,
      edges,
      rootCause: {
        eventId: rootEvent._id,
        description: rootEvent.title,
        summary: `Initial failure detected in ${rootEvent.source}`,
      },
      summary: `Incident caused by ${rootEvent.source} issue affecting ${events.length} events`,
      confidence: 0.85,
    });

    this.emitProgress("Finalizing analysis", 100);

    await causalChain.save();
    return causalChain;
  }

  emitProgress(message, progress) {
    console.log(`[ReasoningEngine] ${message} (${progress}%)`);
  }
}