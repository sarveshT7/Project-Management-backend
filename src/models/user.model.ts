import { genSalt } from "bcryptjs";
import bcrypt from "bcryptjs/umd/types";
import mongoose from "mongoose"

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatar?: string;
    role: 'admin' | 'manager' | 'developer' | 'designer' | 'tester';
    department?: string;
    phone?: string;
    bio?: string;
    skills: string[];
    isActive: boolean;
    isEmailVerified: boolean;
    lastLogin?: Date;
    preferences: {
        theme: 'light' | 'dark' | 'system',
        notifications: {
            email: boolean;
            push: boolean;
            taskUpdates: boolean;
            projectUpdates: boolean;
        };
        timezone: string;
    },
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    getFullName(): string;
}

const userSchema = new mongoose.Schema<IUser>({
    firstName: {
        type: String,
        required: [true, 'First Name is required'],
        trim: true,
        maxlength: [50, 'First Name Cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last Name is required'],
        trim: true,
        maxlength: [50, 'Last Name Cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter the password'],
        trim: true,
        minlength: [6, 'Password must be of atleast 6 characters'],
        select: false
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'developer', 'designer', 'tester'],
        default: 'developer'
    },
    department: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    skills: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            taskAssigned: { type: Boolean, default: true },
            taskCompleted: { type: Boolean, default: true },
            projectUpdates: { type: Boolean, default: true }
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    }
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }

    })

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

//virtual for fullname
userSchema.virtual('fullname').get(function () {
    return `${this.firstName} ${this.lastName}`
})

//hashing the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password)
}

//get fullname method

userSchema.methods.getFullName = function (): string {
    return `${this.firstName} ${this.lastName}`
}

//deleting the password to avoid sending password in reponse 
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();  // Convert Mongoose document to plain object
    delete userObject.password;          // Remove the password property
    return userObject;                   // Return the cleaned object
};

export default mongoose.model<IUser>('User', userSchema)

