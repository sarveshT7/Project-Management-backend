import { Router } from "express";
import {
    createProject,
    getProjects,
    getProjectById,
    getAIProjectSummary
} from "../controllers/project.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate); // All project routes require authentication

router.route("/")
    .post(createProject)
    .get(getProjects);

router.route("/:id")
    .get(getProjectById);

router.get("/:id/summary", getAIProjectSummary);

export default router;
