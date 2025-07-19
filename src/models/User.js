const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const appConfig = require("../config/appConfig");

// Schema
const userSchema = new mongoose.Schema(
        {
                userName: {
                        type: String,
                        required: [true, "userName is required"],
                        unique: true,
                        lowercase: true,
                        index: true,
                },
                fullName: {
                        type: String,
                        required: [true, "fullName is required"],
                        trim: true,
                        index: true,
                },
                email: {
                        type: String,
                        required: [true, "Email is required"],
                        unique: true,
                        lowercase: true,
                        index: true,
                        trim: true,
                },
                password: {
                        type: String,
                        required: [true, "Password is required"],
                        minlength: [6, "Password must be at least 6 characters long"],
                },
                avatar: {
                        public_id: String,
                        url: String,
                },
                coverImage: {
                        public_id: String,
                        url: String,
                },
                refreshToken: {
                        type: String,
                },
                watchHistory: [
                        {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "Video",
                        },
                ],
                isVerified: {
                        type: Boolean,
                        default: false,
                },

                // Channel fields
                channelDescription: {
                        type: String,
                        default: "",
                },
                channelTags: {
                        type: [String],
                        default: [],
                },
                socialLinks: {
                        facebook: String,
                        instagram: String,
                        x: String,
                        website: String,
                },
                notificationSettings: {
                        emailNotifications: {
                                type: Boolean,
                                default: true,
                        },
                        subscriptionActivity: {
                                type: Boolean,
                                default: true,
                        },
                        commentActivity: {
                                type: Boolean,
                                default: true,
                        },
                },

                //   Password reset fields
                refreshPasswordToken: {
                        type: String,
                },
                resetPasswordExpiry: {
                        type: String,
                },

                // Admin role
                isAdmin: {
                        type: Boolean,
                        default: false,
                },
        },
        {
                timestamps: true,
        }
);

// Pre-save hook to hash password before saving
userSchema.pre("save", async function (next) {
        if (!this.isModified("password")) {
                return next();
        }
        this.password = await bcrypt.hash(this.password, 10);
        next();
});

// Method to compare password
userSchema.methods.isPasswordCorrect = async function (password) {
        return await bcrypt.compare(password, this.password);
};

// Generate access token
userSchema.methods.generateAccessToken = function () {
        return jwt.sign(
                { _id: this._id, email: this.email, userName: this.userName, fullName: this.fullName },
                appConfig.accessTokenSecret,
                {
                        expiresIn: appConfig.accessTokenExpiry,
                }
        );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
        return jwt.sign({ _id: this._id }, appConfig.refreshTokenSecret, {
                expiresIn: appConfig.refreshTokenExpiry,
        });
};
//
// Model
const User = mongoose.model("User", userSchema);

module.exports = User;
