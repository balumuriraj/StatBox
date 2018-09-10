import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface ICriticReview extends Document {
  critic: string;
  movieId: number;
  url: string;
  rating: number;
}

const reviewSchema = new Schema({
  critic: String,
  movieId: Number,
  url: String,
  rating: Number
});

reviewSchema.plugin(autoIncrement.plugin, { model: "CriticReview", startAt: 1 });

const CriticReview = mongoose.model<ICriticReview>("CriticReview", reviewSchema, "CriticReviews");

export class CriticReviewModel {
  constructor() {}

  static create(props?: any): Promise<number> {
    const model = new CriticReview(props);

    return new Promise<number>((resolve, reject) => {
      model.save((err: any, result: ICriticReview) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static update(id: number, update: any): Promise<ICriticReview> {
    return new Promise<ICriticReview>((resolve, reject) => {
      CriticReview.findByIdAndUpdate(id, update, (err: any, result: ICriticReview) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static find(query: any = {}): Promise<ICriticReview[]> {
    return new Promise<ICriticReview[]>((resolve, reject) => {
      CriticReview.find(query, (err: any, result: ICriticReview[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: number): Promise<ICriticReview> {
    return new Promise<ICriticReview>((resolve, reject) => {
      CriticReview.findById(id, (err: any, result: ICriticReview) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static aggregate(query: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      CriticReview.aggregate(query, (err: any, result: any[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(CriticReviewModel);
