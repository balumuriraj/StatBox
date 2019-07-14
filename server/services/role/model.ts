import { Document, Schema } from "mongoose";
import { mongoose } from "../../config/database";
import { CounterModel } from "../counter/model";

export interface IRole extends Document {
  roleId: number;
  celebId: number;
  movieId: number;
  index: number;
  type: string;
  category: string;
}

const roleSchema = new Schema({
  roleId: Number,
  celebId: Number,
  movieId: Number,
  index: Number,
  type: String,
  category: String
});
roleSchema.index({roleId: 1}, {unique: true});
roleSchema.index({movieId: 1, category: 1}, {unique: false});
roleSchema.index({celebId: 1}, {unique: false});
roleSchema.index({movieId: 1}, {unique: false});

roleSchema.pre("save", async function(next) {
  const result = await CounterModel.findOneAndUpdate({ name: "Role", field: "roleId" });
  (this as any).roleId = result.count;
  next();
});

const Role = mongoose.model<IRole>("Role", roleSchema, "Roles");

export class RoleModel {
  constructor() {}

  static async create(props?: any): Promise<IRole> {
    const model = new Role(props);
    return model.save();
  }

  static async findByIdAndUpdate(roleId: number, update: any): Promise<IRole> {
    const options = { upsert: true, returnNewDocument: true, new: true };
    return Role.findOneAndUpdate({ roleId }, update, options).exec();
  }

  static async find(query: any[] = [], sort?: any, limitCount?: number, skipCount?: number): Promise<IRole[]> {
    return Role.find(...query).sort(sort).limit(limitCount).skip(skipCount).exec();
  }

  static async findById(roleId: number): Promise<IRole> {
    return Role.findOne({ roleId }).exec();
  }

  static async aggregate(query: any): Promise<any[]> {
    return Role.aggregate(query).allowDiskUse(true).exec();
  }

  static async deleteMany(query: any): Promise<any> {
    return Role.deleteMany(query).exec();
  }

  static async deleteOne(roleId: number): Promise<any> {
    return Role.deleteOne({ roleId }).exec();
  }
}

Object.seal(RoleModel);
