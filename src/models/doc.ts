import mongoose, { Document, Schema } from "mongoose";

export interface IFile extends Document {
  originalName: string;
  key: string;
  bucket: string;
  contentType: string;
  location: string;
  uploadDate: Date;
}

const fileSchema = new Schema<IFile>({
  originalName: { type: String, required: true },
  key: { type: String, required: true },
  bucket: { type: String, required: true },
  contentType: { type: String, required: true },
  location: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});

export const File = mongoose.model<IFile>("File", fileSchema);