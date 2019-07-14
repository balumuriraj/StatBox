import { Document, Schema } from "mongoose";
import { mongoose } from "../../config/database";
import { CounterModel } from "../counter/model";

export interface IVote extends Document {
  voteId: number;
  pollId: number;
  userId: number;
  movieId: number;
  timestamp: number;
}

const voteSchema = new Schema({
  voteId: Number,
  pollId: Number,
  userId: Number,
  movieId: Number,
  timestamp: Number
});
voteSchema.index({voteId: 1}, {unique: true});
voteSchema.pre("save", async function(next) {
  const result = await CounterModel.findOneAndUpdate({ name: "Vote", field: "voteId" });
  (this as any).voteId = result.count;
  next();
});

const Vote = mongoose.model<IVote>("Vote", voteSchema, "Votes");

export class VoteModel {
  constructor() {}

  static async create(props?: any): Promise<IVote> {
    const model = new Vote(props);
    return model.save();
  }

  static async update(query: any, update: any): Promise<IVote> {
    const options =  { upsert: true, returnNewDocument: true, new: true, runValidators: true };
    return Vote.findOneAndUpdate(query, update, options).exec();
  }

  static async find(query: any[] = [], sort?: any, limitCount?: number, skipCount?: number): Promise<IVote[]> {
    return Vote.find(...query).sort(sort).limit(limitCount).skip(skipCount).exec();
  }

  static async findById(voteId: number): Promise<IVote> {
    return Vote.findOne({ voteId }).exec();
  }

  static async aggregate(query: any): Promise<any[]> {
    return Vote.aggregate(query).allowDiskUse(true).exec();
  }

  static async deleteMany(query: any): Promise<any> {
    return Vote.deleteMany(query).exec();
  }

  static async deleteOne(query: any): Promise<any> {
    return Vote.deleteOne(query).exec();
  }
}

Object.seal(VoteModel);
