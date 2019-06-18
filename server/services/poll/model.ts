import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface IPoll extends Document {
  image: string;
  title: string;
  type: "year" | "celeb";
  fitler: number;
  timestamp: number;
}

const pollSchema = new Schema({
  image: String,
  title: String,
  type: String,
  filter: Number,
  timestamp: Number
});

pollSchema.plugin(autoIncrement.plugin, { model: "Poll", startAt: 1 });

const Poll = mongoose.model<IPoll>("Poll", pollSchema, "Polls");

export class PollModel {
  constructor() {}

  static create(props?: any): Promise<number> {
    const model = new Poll(props);

    return new Promise<number>((resolve, reject) => {
      model.save((err: any, result: IPoll) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static update(id: number, update: any): Promise<IPoll> {
    return new Promise<IPoll>((resolve, reject) => {
      Poll.findByIdAndUpdate(id, update, (err: any, result: IPoll) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static find(query: any[] = [], sort?: any, limitCount?: number, skipCount?: number): Promise<IPoll[]> {
    return new Promise<IPoll[]>((resolve, reject) => {
      Poll.find(...query).sort(sort).limit(limitCount).skip(skipCount).exec((err: any, result: IPoll[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: number): Promise<IPoll> {
    return new Promise<IPoll>((resolve, reject) => {
      Poll.findById(id, (err: any, result: IPoll) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static aggregate(query: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      Poll.aggregate(query, (err: any, result: any[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(PollModel);
