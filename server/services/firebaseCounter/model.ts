import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface IFirebaseCounter extends Document {
  moviesCount: number;
  celebsCount: number;
}

const firebaseCounterSchema = new Schema({
  moviesCount: Number,
  celebsCount: Number
});

firebaseCounterSchema.plugin(autoIncrement.plugin, { model: "FirebaseCounter", startAt: 1 });

const FirebaseCounter = mongoose.model<IFirebaseCounter>("FirebaseCounter", firebaseCounterSchema, "FirebaseCounter");

export class FirebaseCounterModel {
  constructor() {}

  static create(props?: any): Promise<number> {
    const model = new FirebaseCounter(props);

    return new Promise<number>((resolve, reject) => {
      model.save((err: any, result: IFirebaseCounter) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static update(id: number, update: any): Promise<IFirebaseCounter> {
    return new Promise<IFirebaseCounter>((resolve, reject) => {
      FirebaseCounter.findByIdAndUpdate(id, update, (err: any, result: IFirebaseCounter) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static find(query: any = {}): Promise<IFirebaseCounter[]> {
    return new Promise<IFirebaseCounter[]>((resolve, reject) => {
      FirebaseCounter.find(query, (err: any, result: IFirebaseCounter[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: number): Promise<IFirebaseCounter> {
    return new Promise<IFirebaseCounter>((resolve, reject) => {
      FirebaseCounter.findById(id, (err: any, result: IFirebaseCounter) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(FirebaseCounterModel);
