import { Request, Response } from "express";

export const handleImageUpload = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    // Return the public URL or relative path
    const imageUrl = `/uploads/${req.file.filename}`;
    return res.status(201).json({ imageUrl });
};