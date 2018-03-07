import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface ICeleb extends Document {
  name: string;
  url: string;
  photo: string;
  dob: Date;
  movieIds: [number];
}

const celebSchema = new Schema({
  name: String,
  url: String,
  photo: String,
  dob: Date,
  movieIds: [Number]
});

celebSchema.plugin(autoIncrement.plugin, { model: "Celeb", startAt: 1 });

const Celeb = mongoose.model<ICeleb>("Celeb", celebSchema, "Celebs");

export class CelebModel {
  constructor() {}

  static create(props?: any): Promise<string> {
    const model = new Celeb(props);

    return new Promise<string>((resolve, reject) => {
      model.save((err: any, result: ICeleb) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static update(id: string, update: any): Promise<ICeleb> {
    return new Promise<ICeleb>((resolve, reject) => {
      Celeb.findByIdAndUpdate(id, update, (err: any, result: ICeleb) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static find(query: any = {}): Promise<ICeleb[]> {
    return new Promise<ICeleb[]>((resolve, reject) => {
      Celeb.find(query, (err: any, result: ICeleb[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: string): Promise<ICeleb> {
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
