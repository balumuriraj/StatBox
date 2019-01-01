import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface ICeleb extends Document {
  name: string;
  hash: string;
  photo: string;
  dob: Date;
}

const celebSchema = new Schema({
  name: String,
  hash: String,
  photo: String,
  dob: Date
});

celebSchema.plugin(autoIncrement.plugin, { model: "Celeb", startAt: 1 });

const Celeb = mongoose.model<ICeleb>("Celeb", celebSchema, "Celebs");

export class CelebModel {
  constructor() {}

  static create(props?: any): Promise<number> {
    const model = new Celeb(props);

    return new Promise<number>((resolve, reject) => {
      model.save((err: any, result: ICeleb) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static update(id: number, update: any): Promise<ICeleb> {
    return new Promise<ICeleb>((resolve, reject) => {
      Celeb.findByIdAndUpdate(id, update, (err: any, result: ICeleb) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static find(query: any[] = [], sort?: any, limitCount?: number, skipCount?: number): Promise<ICeleb[]> {
    return new Promise<ICeleb[]>((resolve, reject) => {
      Celeb.find(...query).sort(sort).limit(limitCount).skip(skipCount).exec((err: any, result: ICeleb[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: number): Promise<ICeleb> {
    return new Promise<ICeleb>((resolve, reject) => {
      Celeb.findById(id, (err: any, result: ICeleb) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(CelebModel);
