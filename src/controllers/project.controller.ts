import { Response } from "express";
import Project from "../models/project.model";
import Task from "../models/task.model";
import { generateProjectSummary } from "../utils/ai.utility";
import { AuthRequest } from "../middleware/auth";

export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, owner, startDate } = req.body;
        if (!name || !description || !startDate || !owner) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const project = await Project.create({ ...req.body, owner: req.user?._id });
        res.status(201).json({ success: true, data: project });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
    try {
        const projects = await Project.find({
            $or: [
                { owner: req.user?._id },
                { team: req.user?._id },
                { managers: req.user?._id },
                { isPublic: true }
            ]
        });
        res.status(200).json({ success: true, data: projects });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        res.status(200).json({ success: true, data: project });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getAIProjectSummary = async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        const tasks = await Task.find({ project: project._id });

        const summary = await generateProjectSummary(project, tasks);

        res.status(200).json({
            success: true,
            data: {
                projectId: project._id,
                projectName: project.name,
                summary: summary
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
