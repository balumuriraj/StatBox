import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface IRole extends Document {
  celebId: number;
  movieId: number;
  index: number;
  type: string;
  category: string;
}

const roleSchema = new Schema({
  celebId: Number,
  movieId: Number,
  index: Number,
  type: String,
  category: String
});

roleSchema.plugin(autoIncrement.plugin, { model: "Role", startAt: 1 });

const Role = mongoose.model<IRole>("Role", roleSchema, "Roles");

export class RoleModel {
  constructor() {}

  static create(props?: any): Promise<number> {
    const model = new Role(props);

    return new Promise<number>((resolve, reject) => {
      model.save((err: any, result: IRole) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static update(id: number, update: any): Promise<IRole> {
    return new Promise<IRole>((resolve, reject) => {
      Role.findByIdAndUpdate(id, update, (err: any, result: IRole) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static find(query: any = {}): Promise<IRole[]> {
    return new Promise<IRole[]>((resolve, reject) => {
      Role.find(query, (err: any, result: IRole[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: number): Promise<IRole> {
    return new Promise<IRole>((resolve, reject) => {
      Role.findById(id, (err: any, result: IRole) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static aggregate(query: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      Role.aggregate(query, (err: any, result: any[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(RoleModel);
