import Event from "../models/Event.js";

export class BaseAgent {
    constructor(name, type, io){
        this.name = name;
        this.type = type;
        this.io = io;
    } 

    async emitStatus(incidentId, message, progress) {
        const status = {
            agent: this.name,
            message,
            progress,
            timestamp: new Date(),
        };


        if (this.io) {
            this.io.to(`incident_${incidentId}`).emit("agent_status", status);
        }
        console.log(`[${this.name}] ${message} (${progress}%)`);
    }

     async saveEvent(incidentId, eventData) {
    const event = new Event({
      incidentId,
      source: this.type,
      ...eventData,
    });
    await event.save();
    return event;
  }

  async execute(incident, context) {
    throw new Error("execute() must be implemented");
  }
}