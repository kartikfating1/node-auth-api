import mongoose, { Schema, Document } from "mongoose";

export interface IPermission extends Document {
  permissionId: string;
  read: boolean;
  roleId: string;
  create: boolean;
  update: boolean;
  moduleId: string;
  delete: boolean;
  createdAt?: Date;
  updatedAt: Date;
  ModuleMaster:Schema.Types.ObjectId;
}

const PermissionSchema: Schema<IPermission> = new Schema<IPermission>({
  permissionId: { type: String },
  read: { type: Boolean },
  roleId: { type: String },
  create: { type: Boolean },
  update: { type: Boolean },
  moduleId: { type: String },
  delete: { type: Boolean },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  ModuleMaster:{ type: Schema.Types.ObjectId, ref: 'Module' },
});

export default mongoose.model<IPermission>("Permission", PermissionSchema);
