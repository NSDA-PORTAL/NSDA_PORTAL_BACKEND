const mongoose = require("mongoose")

const ResourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Resource title is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            enum: ["video", "document", "course", "assignment", "material"],
            required: [true, "Category is required"],
            trim: true,
        },

        link: {
            type: String,
            trim: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },
    },
    {
        timestamps: true,
    }
);

module.exports =
    mongoose.models.Resource ||
    mongoose.model("Resource", ResourceSchema);