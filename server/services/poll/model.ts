import { Document, Schema } from "mongoose";
import { mongoose } from "../../config/database";
import { CounterModel } from "../counter/model";

export interface IPoll extends Document {
  pollId: number;
  image: string;
  title: string;
  type: "year" | "celeb";
  fitler: string;
  timestamp: number;
}

const pollSchema = new Schema({
  pollId: Number,
  image: String,
  title: String,
  type: String,
  filter: String,
  timestamp: Number
});
pollSchema.index({pollId: 1}, {unique: true});
pollSchema.pre("save", async function(next) {
  const result = await CounterModel.findOneAndUpdate({ name: "Poll", field: "pollId" });
  (this as any).pollId = result.count;
  next();
});

const Poll = mongoose.model<IPoll>("Poll", pollSchema, "Polls");

export class PollModel {
  constructor() {}

  static async create(props?: any): Promise<IPoll> {
    const model = new Poll(props);
    return model.save();
  }

  static async update(pollId: number, update: any): Promise<IPoll> {
    const options = { upsert: true, returnNewDocument: true, new: true };
    return Poll.findOneAndUpdate({ pollId }, update, options).exec();
  }

  static async find(query: any[] = [], sort?: any, limitCount?: number, skipCount?: number): Promise<IPoll[]> {
    return Poll.find(...query).sort(sort).limit(limitCount).skip(skipCount).exec();
  }

  static async findById(pollId: number): Promise<IPoll> {
    return Poll.findOne({ pollId }).exec();
  }

  static async aggregate(query: any): Promise<any[]> {
    return Poll.aggregate(query).allowDiskUse(true).exec();
  }

  static async count(query?: any): Promise<number> {
    return Poll.countDocuments(query || {}).exec();
  }

  static async deleteMany(query: any): Promise<any> {
    return Poll.deleteMany(query).exec();
  }

  static async deleteOne(pollId: number): Promise<any> {
    return Poll.deleteOne({ pollId }).exec();
  }
}

Object.seal(PollModel);
