
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../models/project.model';
import Task from '../models/task.model';
import { generateProjectSummary } from '../utils/ai.utility';
import { connectDB } from '../config/db';

dotenv.config();

const runTest = async () => {
    try {
        await connectDB();
        console.log("Connected to Database...");

        // 1. Create a mock project object (don't necessarily need to save for utility test)
        const mockProject = {
            name: "Phoenix Modernization",
            description: "Upgrading the legacy enterprise dashboard to a modern React-based architecture with Gemini integration.",
            status: "active",
            progress: 65,
            priority: "high"
        };

        // 2. Create mock tasks
        const mockTasks = [
            { title: "Setup Project Architecture", status: "completed", priority: "critical", dueDate: new Date('2025-12-20') },
            { title: "Integrate Gemini API", status: "completed", priority: "high", dueDate: new Date('2025-12-25') },
            { title: "Develop Dashboard UI", status: "in-progress", priority: "medium", dueDate: new Date('2026-01-05') },
            { title: "User Acceptance Testing", status: "todo", priority: "high", dueDate: new Date('2026-01-15') }
        ];

        console.log("Generating AI Summary for Test Data...");
        const summary = await generateProjectSummary(mockProject, mockTasks);

        console.log("\n--- AI GENERATED SUMMARY ---");
        console.log(summary);
        console.log("----------------------------\n");

        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
};

runTest();
