import { Router } from "express";
import multer from "multer";
import { handleImageUpload } from "../controllers/uploadController";

const uploadDir = "uploads/";
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        // Use timestamp + original name for uniqueness
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });

const router = Router();
router.post("/", upload.single("image"), handleImageUpload);

export default router;