import { BaseAgent } from "./BaseAgent.js";

export class LogAgent extends BaseAgent {
    constructor(io) {
        super("Log Analyzer", "log", io)
    }

    async execute(incident, context) {
        await this.emitStatus(incident._id, "Starting log analysis", 10);

        const events = [];
        const incidentTime = new Date(incident.timestamp);

        const logEntries = [
            {
                title: "Database connection pool exhausted",
                description: "connection pool reached maximum limit",
                timestamp: new Date(incidentTime.getTime() - 5 * 60000),
                severity: "warning",
                data: { poolSize: 100, active: 100 },
            },
            {
                title: incident.title || "Server failure detcted",
                description: "Unhandled exception in request handler",
                timestamp: incidentTime,
                severity: "error",
                data: { errorCode: 500, stack: "Error at handler.js:89" },
            },
            {
                title: "Failed to fetch user data",
                description: "User service returned 500 status",
                timestamp: new Date(incidentTime.getTime() + 1 * 60000),
                severity: "error",
                data: { retries: 3, service: "user-api" },
            },
        ];

        for (let i = 0; i < logEntries.length; i++) {
            const log = logEntries[i];
            await this.emitStatus(
                incident._id,
                `Analyzing: ${log.title}`,
                30 + i * 20
            );

            const event = await this.saveEvent(incident._id, log);
            events.push(event);
        }

        await this.emitStatus(incident._id, "Log analysis complete", 100);

        return {
      agent: "LogAgent",
      events,
      summary: `Found ${events.length} relevant log entries`,
      errorCount: events.filter((e) => e.severity === "error").length,
    };
    }
}