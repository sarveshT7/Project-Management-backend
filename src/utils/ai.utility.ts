import { model } from "../config/gemini";

export const generateProjectSummary = async (projectData: any, tasks: any[]) => {
    try {
        const prompt = `
            Analyze the following project and its tasks to provide a concise, professional summary for a weekly report.
            Include:
            1. Overall progress and status.
            2. Key accomplishments based on completed tasks.
            3. Immediate priorities based on pending tasks.
            4. Any potential risks or blockers (e.g., overdue tasks).

            Project Details:
            - Name: ${projectData.name}
            - Description: ${projectData.description}
            - Status: ${projectData.status}
            - Progress: ${projectData.progress}%
            - Priority: ${projectData.priority}

            Tasks:
            ${tasks.map(t => `- [${t.status}] ${t.title} (Priority: ${t.priority}${t.dueDate ? `, Due: ${t.dueDate.toDateString()}` : ''})`).join('\n')}

            Output should be a concise summary suitable for a management report, saving 2 hours per week in reporting.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating project summary:", error);
        throw new Error("Failed to generate AI summary");
    }
};
