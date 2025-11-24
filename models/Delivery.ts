import mongoose, { Schema, Document, Model } from "mongoose";

export type DeliveryStatus = "pendiente" | "en_ruta" | "entregado" | "no_entregado";

export interface IDelivery extends Document {
  orderId?: string; // id de la orden del sistema de seguimiento
  trackingCode: string; // código que ve el cliente
  customerName: string;
  customerDocument: string; // RUT o DNI esperado
  address: string;
  products: string[];
  assignedTo: mongoose.Types.ObjectId | null; // User repartidor
  status: DeliveryStatus;
  proofPhotoUrl?: string;
  proofPhotoId?: string;
  receiverName?: string;
  receiverDocument?: string;
  deliveredAt?: Date;
  observation?: string;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    orderId: { type: String, required: false, default: "" },
    trackingCode: { type: String, required: true },
    customerName: { type: String, required: true },
    customerDocument: { type: String, required: true },
    address: { type: String, required: true },
    products: [{ type: String }],
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["pendiente", "en_ruta", "entregado", "no_entregado"],
      default: "pendiente"
    },
    proofPhotoUrl: { type: String },
    proofPhotoId: { type: String },
    receiverName: { type: String },
    receiverDocument: { type: String },
    deliveredAt: { type: Date },
    observation: { type: String }
  },
  { timestamps: true }
);

export const Delivery: Model<IDelivery> =
  mongoose.models.Delivery ||
  mongoose.model<IDelivery>("Delivery", DeliverySchema);
