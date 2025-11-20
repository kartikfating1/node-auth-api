import { Model, Schema, model } from "mongoose";

interface paCompany extends Document {
  companyname: string;
  address: string;
}

const CompanySchema: Schema<paCompany> = new Schema({
  companyname: String,
  address: String,
});

const Company: Model<paCompany> = model("Company", CompanySchema);
export default Company;
