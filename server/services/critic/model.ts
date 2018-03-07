import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface ICritic extends Document {
  name: string;
  image: string;
  url: string;
  reviewIds: [string];
}

// To remove deprecation error
// mongoose.Promise = global.Promise;

const criticSchema = new Schema({
  name: String,
  image: String,
  url: String,
  reviewIds: [String]
});

criticSchema.plugin(autoIncrement.plugin, { model: "Critic", startAt: 1 });

const Critic = mongoose.model<ICritic>("Critic", criticSchema, "Critics");

export class CriticModel {
  constructor() {}

  static create(props?: any): Promise<string> {
    const model = new Critic(props);

    return new Promise<string>((resolve, reject) => {
      model.save((err: any, result: ICritic) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static update(id: string, update: any): Promise<ICritic> {
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

  static findById(id: string): Promise<ICritic> {
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
