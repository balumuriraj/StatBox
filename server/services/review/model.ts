import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface IReview extends Document {
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

reviewSchema.plugin(autoIncrement.plugin, { model: "Review", startAt: 1 });

const Review = mongoose.model<IReview>("Review", reviewSchema, "Reviews");

export class ReviewModel {
  constructor() {}

  static create(props?: any): Promise<number> {
    const model = new Review(props);

    return new Promise<number>((resolve, reject) => {
      model.save((err: any, result: IReview) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static update(id: number, update: any): Promise<IReview> {
    return new Promise<IReview>((resolve, reject) => {
      Review.findByIdAndUpdate(id, update, (err: any, result: IReview) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static find(query: any = {}): Promise<IReview[]> {
    return new Promise<IReview[]>((resolve, reject) => {
      Review.find(query, (err: any, result: IReview[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: number): Promise<IReview> {
    return new Promise<IReview>((resolve, reject) => {
      Review.findById(id, (err: any, result: IReview) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static aggregate(query: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      Review.aggregate(query, (err: any, result: any[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(ReviewModel);
