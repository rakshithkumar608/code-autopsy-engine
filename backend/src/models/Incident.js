import mongoose from "mongoose";


const incidentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        environment: {
            type: String,
            enum: ["prod", "staging", "dev"],
            default: "prod",
        },
        severity: {
            type: String,
            enum: ["critical", "high", "medium", "low"],
            default: "medium",
        },
        status: {
            type: String,
            enum: ["triggered", "investigating", "completed", "failed"],
            default: "triggered",
        },
        events: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Event",
            },
        ],
        causalChain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CausalChain",
        },
        postmortem: {
            rootCause: String,
            impact: String,
            immediateFix: String,
            longTermFix: String,
            preventionSteps: [String],
            affectedServices: [String],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Incident", incidentSchema);