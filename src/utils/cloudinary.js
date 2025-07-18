const cloudinary = require("cloudinary").v2;
const appConfig = require("../config/appConfig");
const ApiError = require("./apiError");
// Configure Cloudinary
cloudinary.config({
        cloud_name: appConfig.cloudinary.cloudName,
        api_key: appConfig.cloudinary.apiKey,
        api_secret: appConfig.cloudinary.apiSecret,
});

// Upload a file to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
        try {
                if (!filePath) return null;
                const result = await cloudinary.uploader.upload(filePath, {
                        resource_type: "auto",
                        folder: folder,
                });
                return result;
        } catch (error) {
                throw new Error("Failed to upload file to Cloudinary");
        }
};

// Delete a file from Cloudinary
const deleteFromCloudinary = async (publicId, resource_type = "image") => {
        try {
                await cloudinary.uploader.destroy(publicId, {
                        resource_type: resource_type,
                });
        } catch (error) {
                throw new Error("Failed to delete file from Cloudinary");
        }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
