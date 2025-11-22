import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  username?: string;
  email?: string;
  password?: string;
  passwordHash?: string;
  role: "repartidor" | "admin";
  active: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, default: "" }, // compatibilidad con altas locales
    passwordHash: { type: String, default: "" }, // compatibilidad con el panel principal
    role: { type: String, enum: ["repartidor", "admin"], default: "repartidor" },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
