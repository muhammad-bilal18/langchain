import { Router, Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { config as dotenvConfig } from 'dotenv';
import { upload } from "../middlewares/multer";
import { File } from "../models/doc";

dotenvConfig();

const {
  AWS_BUCKET,
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  AWS_REGION
} = process.env;

if (!AWS_BUCKET || !AWS_ACCESS_KEY || !AWS_SECRET_KEY || !AWS_REGION) {
  throw new Error('Missing AWS configuration in environment variables');
}

const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY!,
      secretAccessKey: AWS_SECRET_KEY!,
    },
  });

const router = Router();

router.post('/', upload.single('file'), async (req: Request, res: Response) => {

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const file = req.file;

    const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: AWS_BUCKET!,
          Key: file.originalname,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'private',
        },
      });

    try {
      const uploadResult = await upload.done();
      const fileDocument = new File({
        originalName: file.originalname,
        key: file.originalname,
        bucket: AWS_BUCKET,
        contentType: file.mimetype,
        location: uploadResult.Location,
      });
  
      await fileDocument.save();
      res.status(200).json({
        message: 'File uploaded successfully',
        location: uploadResult.Location
      });
    } catch (uploadError) {
      console.error('S3 Upload Error:', uploadError);
      res.status(500).json({ message: 'Failed to upload file' });
    }

});

export default router;