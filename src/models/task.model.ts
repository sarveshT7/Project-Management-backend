import mongoose, { Schema } from "mongoose";
export interface ITask extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    project: mongoose.Types.ObjectId;
    assignee?: mongoose.Types.ObjectId;
    reporter: mongoose.Types.ObjectId;
    dueDate?: Date;
    estimatedHours?: number;
    actualHours?: number;
    tags: string[];
    attachments: {
        filename: string;
        url: string;
        size: number;
        uploadedBy: mongoose.Types.ObjectId;
        uploadedAt: Date;
    }[];
    comments: {
        user: mongoose.Types.ObjectId;
        content: string;
        createdAt: Date;
    }[];
    dependencies: mongoose.Types.ObjectId[];
    subtasks: mongoose.Types.ObjectId[];
    parent?: mongoose.Types.ObjectId;
    position: number;
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Task title cannot exceed 200 characters']
        },
        description: {
            type: String,
            maxlength: [2000, 'Description cannot exceed 2000 characters']
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'review', 'completed', 'cancelled'],
            default: 'todo'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Project is required']
        },
        assignee: {
            tpe: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Assignee is required']
        },
        reporter: {
            tpe: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Reporter is required']
        },
        dueDate: {
            type: Date
        },
        estimatedHours: {
            type: Number,
            min: [0, 'Estimated hours cannot be negative']
        },
        actualHours: {
            type: Number,
            min: [0, 'Actual hours cannot be negative']
        },
        tags: [{
            type: String,
            trim: true
        }],
        attachments: {
            filename: { type: String, required: true },
            url: { type: String, required: true },
            size: { type: Number, required: true },
            uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            uploadedAt: { type: Date, default: Date.now() }
        },
        comments: [{
            user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            content: { type: String, required: true, maxlength: 1000 },
            createdAt: { type: Date, default: Date.now }
        }],
        dependencies: [{
            type: Schema.Types.ObjectId,
            ref: 'Task'
        }],
        subtasks: [{
            type: Schema.Types.ObjectId,
            ref: 'Task'
        }],
        parent: {
            type: Schema.Types.ObjectId,
            ref: 'Task'
        },
        position: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    })

// Indexes
taskSchema.index({ project: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ reporter: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ parent: 1 });
taskSchema.index({ position: 1 });

// Compound indexes
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ project: 1, position: 1 });

// Virtual for overdue status

taskSchema.virtual('isOverdue').get(function () {
    return this.dueDate && this.dueDate < new Date() && this.status !== "completed"
})

export default mongoose.model<ITask>('Task', taskSchema)