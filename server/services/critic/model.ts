import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface ICritic extends Document {
  name: string;
  image: string;
  reviewIds: [number];
}

const criticSchema = new Schema({
  name: String,
  image: String,
  reviewIds: [Number]
});

criticSchema.plugin(autoIncrement.plugin, { model: "Critic", startAt: 1 });

const Critic = mongoose.model<ICritic>("Critic", criticSchema, "Critics");

export class CriticModel {
  constructor() {}

  static create(props?: any): Promise<number> {
    const model = new Critic(props);

    return new Promise<number>((resolve, reject) => {
      model.save((err: any, result: ICritic) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static update(id: number, update: any): Promise<ICritic> {
    return new Promise<ICritic>((resolve, reject) => {
      Critic.findByIdAndUpdate(id, update, (err: any, result: ICritic) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static find(query: any = {}): Promise<ICritic[]> {
    return new Promise<ICritic[]>((resolve, reject) => {
      Critic.find(query, (err: any, result: ICritic[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: number): Promise<ICritic> {
    return new Promise<ICritic>((resolve, reject) => {
      Critic.findById(id, (err: any, result: ICritic) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(CriticModel);
