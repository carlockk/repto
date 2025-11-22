import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStatus extends Document {
  name: string;
  description?: string;
}

const StatusSchema = new Schema<IStatus>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String }
  },
  { timestamps: true }
);

export const Status: Model<IStatus> =
  mongoose.models.Status || mongoose.model<IStatus>("Status", StatusSchema);
