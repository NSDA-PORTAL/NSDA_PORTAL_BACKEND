const Resource = require("../models/Resource");

const getResources = async (req, res) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const createResource = async (req, res) => {
    try {
        const { title, description, category, link } = req.body;

        if (!title || !link) {
            return res.status(400).json({ message: "Title and Link are required"});
        }
        if (!category) {
            return res.status(400).json({ message: "Category is required"});
        }

        const allowedCategories = ["video", "document", "course", "assignment", "material"];
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }

        const uploadedBy =req.user?.id || null;

        const resource = await Resource.create({
            title,
            description,
            category,
            link,
            uploadedBy,
        });

        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await Resource.findById(id);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found " });
        }
        await resource.deleteOne();
        
        res.status(200).json({ message: "Resource deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message});
    }
};

module.exports = {
    getResources,
    createResource,
    deleteResource,
};