import { Router } from "express";
import multer from "multer";
import { handleImageUpload } from "../controllers/uploadController";

// --- Accept only image files ---
const imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const fileFilter: multer.Options["fileFilter"] = (_, file, cb) => {
    if (imageMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"));
    }
};

const uploadDir = "uploads/";
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (_, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const upload = multer({ storage, fileFilter });

const router = Router();
router.post("/", upload.single("image"), handleImageUpload);

// --- Multer error handler for invalid file type ---
router.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError || err.message === "Only image files are allowed!") {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

export default router;