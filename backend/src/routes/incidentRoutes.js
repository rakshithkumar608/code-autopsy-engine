import  express from "express";
import Incident from "../models/Incident.js";
// import { Orchestrator } from "../orchestrator/Orchestrator.js";



const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const incidents = await Incident.find().sort({ timestamp: -1 })
        res.json(incidents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//  Get Signal incident
router.get("/:id", async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)
        .populate("events")
        .populate("causalChain");
        if(!incident) {
            return res.status(404).json({ error: "Incident not found" });
        }
        res.json(incident);
    } catch (error) {
        res.status(500).json({  error: error.message })
    }
});

// Create incident and start investigation
router.post("/", async (req, res) => {
    try {
        const { title, description, environment } = req.body;

        const incident = new Incident({
            title,
            description: description || "",
            environment: environment || "prod",
            status: "triggered",
            timestamp: new Date(),
        });

        await incident.save();

        const io = req.app.get("io");

        const orchestrator = new Orchestrator(incident, io);
        orchestrator.startInvestigation().catch(console.error);

        res.json({
            success: true,
            incidentId: incident._id,
            message: "Investigation started",
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router;