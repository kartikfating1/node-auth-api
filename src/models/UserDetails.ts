import mongoose,{ Schema, Document } from "mongoose";

export interface IUserDetails extends Document {
  profilephoto: string;
  companyDetailId: string;
  userId: string;
  username: string;
  companyId: string;
  roleId: string;
  createdAt?: Date;
  updatedAt: Date;
}

const userDetailsSchema: Schema<IUserDetails> = new Schema<IUserDetails>({
  userId:   { type: String },
  username: { type: String },
  companyId: { type: String },
  roleId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export default mongoose.model<IUserDetails>("UserDetails", userDetailsSchema);
