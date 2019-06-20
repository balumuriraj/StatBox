import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface IUser extends Document {
  authId: string;
  bookmarks: [number];
  favorites: [number];
}

const userSchema = new Schema({
  authId: { type: String, unique : true },
  bookmarks: [Number],
  favorites: [Number]
});

userSchema.plugin(autoIncrement.plugin, { model: "User", startAt: 1 });
userSchema.index({authId: 1}, {unique: true});

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

  static deleteMany(query: any): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      User.deleteMany(query, (err: any) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }

  static deleteOne(query: any): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      User.deleteOne(query, (err: any) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }

  static update(id: number, update: any): Promise<IUser> {
    return new Promise<IUser>((resolve, reject) => {
      User.findByIdAndUpdate(id, update, {new: true}, (err: any, result: IUser) => {
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

  static findOneOrUpdate(query: any): Promise<any> {
    return new Promise<any[]>((resolve, reject) => {
      User.find(query, (err: any, result: IUser[]) => {
        if (err) {
          reject(err);
        }

        if (result[0]) {
          resolve(result[0]._id);
        } else {
          const model = new User({
            authId: query.authId,
            bookmarks: [],
            favorites: []
          });
          model.save((err: any, result: IUser) => {
            if (err) {
              reject(err);
            }

            resolve(result && result._id);
          });
        }
      });
    });
  }
}

Object.seal(UserModel);
