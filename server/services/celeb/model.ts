import { Document, Schema } from "mongoose";
import { mongoose } from "../../config/database";
import { CounterModel } from "../counter/model";

export interface ICeleb extends Document {
  celebId: number;
  algoliaId: string;
  name: string;
  hash: string;
  photo: string;
  dob: Date;
}

const celebSchema = new Schema({
  celebId: Number,
  algoliaId: String,
  name: String,
  hash: String,
  photo: String,
  dob: Date
});
celebSchema.index({celebId: 1}, {unique: true});
celebSchema.pre("save", async function(next) {
  const result = await CounterModel.findOneAndUpdate({ name: "Celeb", field: "celebId" });
  (this as any).celebId = result.count;
  next();
});

const Celeb = mongoose.model<ICeleb>("Celeb", celebSchema, "Celebs");

export class CelebModel {
  constructor() {}

  static async create(props?: any): Promise<ICeleb> {
    const model = new Celeb(props);
    return model.save();
  }

  static async update(celebId: number, update: any): Promise<ICeleb> {
    const options = { upsert: true, returnNewDocument: true, new: true };
    return Celeb.findOneAndUpdate({ celebId }, update, options).exec();
  }

  static async bulkUpdate(queries: any[], updates: any[]): Promise<any> {
    const bulk = Celeb.collection.initializeUnorderedBulkOp();
    const length = queries.length;

    for (let i = 0; i < length; i++) {
      bulk.find(queries[i]).update(updates[i]);
    }

    return bulk.execute();
  }

  static async find(query: any[] = [], sort?: any, limitCount?: number, skipCount?: number): Promise<ICeleb[]> {
    return Celeb.find(...query).sort(sort).limit(limitCount).skip(skipCount).exec();
  }

  static async findById(celebId: number): Promise<ICeleb> {
    return Celeb.findOne({ celebId }).exec();
  }

  static async aggregate(query: any): Promise<any[]> {
    return Celeb.aggregate(query).allowDiskUse(true).exec();
  }

  static async count(query?: any): Promise<number> {
    return Celeb.countDocuments(query || {}).exec();
  }

  static async deleteMany(query: any): Promise<any> {
    return Celeb.deleteMany(query).exec();
  }

  static async deleteOne(celebId: number): Promise<any> {
    return Celeb.deleteOne({ celebId }).exec();
  }
}

Object.seal(CelebModel);
