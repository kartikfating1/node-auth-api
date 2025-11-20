import { Schema, model, Document } from "mongoose";

export interface IModuleMaster extends Document {
  moduleId: string;
  moduleName: string;
  createdAt?: Date;
  updatedAt: Date;
}

const ModuleMasterSchema: Schema = new Schema(
  {
    moduleId: { type: String },
    moduleName: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  },
  { collection: "modulemasters" },
);

export default model<IModuleMaster>("ModuleMasters", ModuleMasterSchema);
