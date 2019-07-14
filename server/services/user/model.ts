import { Document, Schema } from "mongoose";
import { mongoose } from "../../config/database";
import { CounterModel } from "../counter/model";

export interface IUser extends Document {
  userId: number;
  authId: string;
  bookmarks: [number];
  favorites: [number];
}

const userSchema = new Schema({
  userId: Number,
  authId: { type: String, unique : true },
  bookmarks: [Number],
  favorites: [Number]
});
userSchema.index({userId: 1}, {unique: true});
userSchema.index({authId: 1}, {unique: true});
userSchema.pre("save", async function(next) {
  const result = await CounterModel.findOneAndUpdate({ name: "User", field: "userId" });
  (this as any).userId = result.count;
  next();
});

const User = mongoose.model<IUser>("User", userSchema, "Users");

export class UserModel {
  constructor() {}

  static async create(props?: any): Promise<IUser> {
    const model = new User(props);
    return model.save();
  }

  static async updateMany(query: any, update: any): Promise<IUser[]> {
    return User.updateMany(query, update).exec();
  }

  static async findOneAndUpdate(query: any, update: any): Promise<IUser> {
    const options =  { upsert: true, returnNewDocument: true, new: true, runValidators: true };
    return User.findOneAndUpdate(query, update, options).exec();
  }

  static async find(query: any[] = [], sort?: any, limitCount?: number, skipCount?: number): Promise<IUser[]> {
    return User.find(...query).sort(sort).limit(limitCount).skip(skipCount).exec();
  }

  static async findById(userId: number): Promise<IUser> {
    return User.findOne({ userId }).exec();
  }

  static async aggregate(query: any): Promise<any[]> {
    return User.aggregate(query).allowDiskUse(true).exec();
  }

  static async count(query?: any): Promise<number> {
    return User.countDocuments(query || {}).exec();
  }

  static async deleteMany(query: any): Promise<any> {
    return User.deleteMany(query).exec();
  }

  static async deleteOne(query: any): Promise<any> {
    return User.deleteOne(query).exec();
  }

  static async findOneOrCreate(query: any): Promise<any> {
    const user = await User.findOne(query).exec();

    if (user) {
      return user;
    }

    const model = new User({
      authId: query.authId,
      bookmarks: [],
      favorites: []
    });
    return await model.save();
  }
}

Object.seal(UserModel);
