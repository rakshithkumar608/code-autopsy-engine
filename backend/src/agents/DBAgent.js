import { BaseAgent } from "./BaseAgent.js";

export class DBAgent extends BaseAgent {
  constructor(io) {
    super("DB Inspector", "database", io);
  }

  async execute(incident, context) {
    await this.emitStatus(incident._id, "Checking database health", 10);

    const events = [];
    const incidentTime = new Date(incident.timestamp);

    // Simulated DB issues
    const dbIssues = [
      {
        title: "Slow query detected",
        description: "Query on users collection took 5.2 seconds",
        timestamp: new Date(incidentTime.getTime() - 2 * 60000),
        severity: "warning",
        data: { query: "db.users.find()", duration: 5200 },
      },
      {
        title: "Missing index on critical field",
        description: "Collection 'orders' missing index on 'userId'",
        timestamp: incidentTime,
        severity: "error",
        data: { collection: "orders", field: "userId" },
      },
    ];

    for (let i = 0; i < dbIssues.length; i++) {
      const issue = dbIssues[i];
      await this.emitStatus(
        incident._id,
        `Analyzing: ${issue.title}`,
        30 + i * 35
      );

      const event = await this.saveEvent(incident._id, issue);
      events.push(event);
    }

    await this.emitStatus(incident._id, "Database analysis complete", 100);

    return {
      agent: "DBAgent",
      events,
      summary: `Found ${events.length} database issues`,
    };
  }
}