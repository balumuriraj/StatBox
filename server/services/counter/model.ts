import { Document, Schema } from "mongoose";
import { mongoose } from "../../config/database";

export interface ICounter extends Document {
  name: string;
  field: string;
  count: number;
}

const counterSchema = new Schema({
  name: String,
  field: String,
  count: Number
});

const Counter = mongoose.model<ICounter>("Counter", counterSchema, "Counters");

export class CounterModel {
  constructor() {}

  static async create(props?: any): Promise<any> {
    const model = new Counter(props);
    return model.save();
  }

  static async update(id: number, update: any): Promise<ICounter> {
    return Counter.findByIdAndUpdate(id, update).exec();
  }

  static async find(query: any[] = [], sort?: any, limitCount?: number, skipCount?: number): Promise<ICounter[]> {
    return Counter.find(...query).sort(sort).limit(limitCount).skip(skipCount).exec();
  }

  static async findById(id: number): Promise<ICounter> {
    return Counter.findById(id).exec();
  }

  static async findOneAndUpdate(filter: { name: string; field: string; }): Promise<ICounter> {
    const update = { $inc: { count: 1 } };
    const options = { upsert: true, returnNewDocument: true, new: true };
    return Counter.findOneAndUpdate(filter, update, options).exec();
  }
}

Object.seal(CounterModel);
