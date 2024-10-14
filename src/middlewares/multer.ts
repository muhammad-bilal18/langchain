import { Request } from 'express';
import multer from "multer";

const storage = multer.diskStorage({
    filename: function(_req: Request, file, cb) {
        cb(null, file.originalname);
    }
});

export const upload = multer({storage})