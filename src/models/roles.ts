import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  // _id: ObjectId;
  roleId: string;
  name: string;
  companyId: string;
  createdAt?: Date;
  updatedAt: Date;
}

const RoleSchema: Schema<IRole> = new Schema<IRole>({
  // _id: { type: Schema.Types.ObjectId, required: true },
  roleId: { type: String },
  name: { type: String },
  companyId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export default mongoose.model<IRole>("Role", RoleSchema);
