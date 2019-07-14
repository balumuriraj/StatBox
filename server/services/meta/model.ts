import { Document, Schema } from "mongoose";
import { mongoose } from "../../config/database";
import { CounterModel } from "../counter/model";

export interface IMeta extends Document {
  metaId: number;
  years: [number];
  months: [string];
  movieIds: [number];
  celebIds: [number];
  algoliaMovieIds: [string];
  algoliaCelebIds: [string];
  type: string;
  databaseUpdatedAt: number;
  firebaseUpdatedAt: number;
  algoliaUpdatedAt: number;
}

const metaSchema = new Schema({
  metaId: Number,
  years: [Number],
  months: [String],
  movieIds: [Number],
  celebIds: [Number],
  algoliaMovieIds: [String],
  algoliaCelebIds: [String],
  type: String,
  databaseUpdatedAt: Number,
  firebaseUpdatedAt: Number,
  algoliaUpdatedAt: Number
});
metaSchema.index({metaId: 1}, {unique: true});
metaSchema.pre("save", async function(next) {
  const result = await CounterModel.findOneAndUpdate({ name: "Meta", field: "metaId" });
  (this as any).metaId = result.count;
  next();
});

const Meta = mongoose.model<IMeta>("Meta", metaSchema, "Metas");

export class MetaModel {
  constructor() {}

  static async create(props?: any): Promise<IMeta> {
    const model = new Meta(props);
    return model.save();
  }

  static async updateMany(query: any, update: any): Promise<IMeta[]> {
    return Meta.updateMany(query, update).exec();
  }

  static async findByIdAndUpdate(metaId: number, update: any): Promise<IMeta> {
    const options = { upsert: true, returnNewDocument: true, new: true };
    return Meta.findOneAndUpdate({ metaId }, update, options).exec();
  }

  static async find(query: any[] = [], sort?: any, limitCount?: number, skipCount?: number): Promise<IMeta[]> {
    return Meta.find(...query).sort(sort).limit(limitCount).skip(skipCount).exec();
  }

  static async findOne(query: any): Promise<IMeta> {
    return Meta.findOne(query).exec();
  }

  static async findById(metaId: number): Promise<IMeta> {
    return Meta.findOne({ metaId }).exec();
  }

  static async aggregate(query: any): Promise<any[]> {
    return Meta.aggregate(query).exec();
  }
}

Object.seal(MetaModel);
