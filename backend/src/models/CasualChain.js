import mongoose from "mongoose";

const casualChainSchema = new mongoose.Schema(
    {
        incidentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Incident",
            required: true,
            unique: true,
        },
        nodes: [
            {
                eventId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Event",
                },
                description: String,
                confidence: Number,
                position: {
                    x: Number,
                    y: Number,
                },
            },
        ],
        edges: [
            {
                from: {
                    type: mongoose.Schema.Types.ObjectId,
                },
                to: {
                    type: mongoose.Schema.Types.ObjectId,
                },
                relationship: {
                    type: String,
                    enum: ["causes", "precedes", "correlates"],
                    default: "causes",
                },
                strength: Number,
                reasoning: String,
            },
        ],
        rootCause: {
        eventId: mongoose.Schema.Types.ObjectId,
        description: String,
        summary: String,
        },
        summary: {
        type: String,
        default: "",
        },
        confidence: {
        type: Number,
        default: 0,
        },
    },
    {
        timestamps: true,
    }
);


export default mongoose.model("CausalChain", causalChainSchema);