import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface IUser extends Document {
  authId: string;
  bookmarks: [number];
  notInterested: [number];
}

const userSchema = new Schema({
  authId: String,
  bookmarks: [Number],
  notInterested: [Number]
});

userSchema.plugin(autoIncrement.plugin, { model: "User", startAt: 1 });

const User = mongoose.model<IUser>("User", userSchema, "Users");


export class UserModel {
  constructor() {}

  static create(props?: any): Promise<number> {
    const model = new User(props);

    return new Promise<number>((resolve, reject) => {
      model.save((err: any, result: IUser) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static update(id: number, update: any): Promise<IUser> {
    return new Promise<IUser>((resolve, reject) => {
      User.findByIdAndUpdate(id, update, (err: any, result: IUser) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static find(query: any = {}): Promise<IUser[]> {
    return new Promise<IUser[]>((resolve, reject) => {
      User.find(query, (err: any, result: IUser[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: number): Promise<IUser> {
    return new Promise<IUser>((resolve, reject) => {
      User.findById(id, (err: any, result: IUser) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static aggregate(query: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      User.aggregate(query, (err: any, result: any[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(UserModel);
