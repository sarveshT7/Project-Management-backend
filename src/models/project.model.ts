import mongoose, { Schema } from "mongoose";

export interface IProject extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    startDate: Date;
    endDate?: Date;
    budget?: number;
    progress: number;
    owner: mongoose.Types.ObjectId;
    team: mongoose.Types.ObjectId[];
    managers: mongoose.Types.ObjectId[];
    tags: string[];
    color: string;
    isPublic: boolean;
    settings: {
        allowGuestAccess: boolean;
        requireApproval: boolean;
        autoAssignTasks: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const projectSchema = new mongoose.Schema<IProject>({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    status: {
        type: String,
        enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
        default: 'planning'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        validate: function (this: IProject, value: Date) {
            return !value || value > this.startDate
        },
        message: "End date must be after start date"
    },
    budget: {
        type: Number,
        min: [0, 'budegt cannot be negative']
    },
    progress: {
        type: Number,
        default: 0,
        min: [0, 'Progress cannot be negative'],
        max: [100, 'Progress cannot exceed 100%']
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Project owner is required']
    },
    team: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    managers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [{
        type: String,
        trim: true
    }],
    color: {
        type: String,
        default: '#3B82F6',
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format']
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    settings: {
        allowGuestAccess: { type: Boolean, default: false },
        requireApproval: { type: Boolean, default: false },
        autoAssignTasks: { type: Boolean, default: false }
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

//Indexes

projectSchema.index({ owner: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ team: 1 });
projectSchema.index({ managers: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ startDate: 1 });
projectSchema.index({ endDate: 1 });

//virtual for completed task count

projectSchema.virtual('completedTasksCount', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'project',
    count: true,
    match: { status: 'completed' }
})

// Pre-save middleware to update progress
projectSchema.pre('save', function (next) {
    if (this.endDate && this.endDate <= new Date() && this.status !== "completed") {
        this.status = 'completed'
    }
    next()
})

export default mongoose.model<IProject>('Project', projectSchema)