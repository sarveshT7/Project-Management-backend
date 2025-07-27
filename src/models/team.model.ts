import mongoose from "mongoose";

export interface ITeam extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    lead: mongoose.Types.ObjectId;
    members: {
        user: mongoose.Types.ObjectId;
        role: String;
        joinedAt: Date;
    }[],
    projects: mongoose.Types.ObjectId[];
    department: string;
    isActive: boolean;
    settings: {
        allowMemberInvite: boolean;
        requireApprovalToJoin: boolean;
        visibility: 'public' | 'private' | 'internal';
    };
    createdAt: Date;
    updatedAt: Date;
}
const teamSchema = new mongoose.Schema<ITeam>({
    name: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true,
        maxlength: [100, 'Team name cannot exceed 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Team lead is required']
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            required: true,
            trim: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    department: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    settings: {
        allowMemberInvite: { type: Boolean, default: true },
        requireApprovalToJoin: { type: Boolean, default: false },
        visibility: {
            type: String,
            enum: ['public', 'private', 'internal'],
            default: 'internal'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
teamSchema.index({ lead: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ department: 1 });
teamSchema.index({ isActive: 1 });

// virtual for member count

teamSchema.virtual('memberCount').get(function () {
    return this.members.length
})