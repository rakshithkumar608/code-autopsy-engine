import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        incidentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Incident",
            required: true,
        },
        source: {
            type: String,
            enum: ["log", "git","database", "deployment"],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        timestamp: {
            type: Date,
            required: true,
        },
        severity: {
            type: String,
            enum: ["error", "warning", "info"],
            default: "info",
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Event", eventSchema);