import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY } from "../constants.js";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: [true, "Full Name is required"],
            trim: true,
            index: true
        },
        profileImage: {
            type: String,
            default: ""
        },
        coverImage: {
            type: String
        },
        password: {
            type: String,
            required: [
                function () {
                    return !this.googleId;
                },
                "Password is required"
            ]
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        refreshToken: {
            type: String
        },
        role: {
            type: String,
            enum: ["Freelancer", "Client"],
            required: true
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpire: {
            type: Date
        },

        skills: {
            type: [String],
            default: []
        },
        bio: {
            type: String,
            default: ""
        },
        portfolio: {
            type: String,
            default: ""
        },
        rating: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
            role: this.role
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

userSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        return ret;
    }
});

userSchema.set("toObject", {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        return ret;
    }
});

export const User = mongoose.model("User", userSchema);
