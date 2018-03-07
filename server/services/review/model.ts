import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface IReview extends Document {
  criticId: string;
  movieId: string;
  url: string;
  rating: number;
}

// To remove deprecation error
// mongoose.Promise = global.Promise;

const reviewSchema = new Schema({
  criticId: String,
  movieId: String,
  url: String,
  rating: Number
});

reviewSchema.plugin(autoIncrement.plugin, { model: "Review", startAt: 1 });

const Review = mongoose.model<IReview>("Review", reviewSchema, "Reviews");

export class ReviewModel {
  constructor() {}

  static create(props?: any): Promise<string> {
    const model = new Review(props);

    return new Promise<string>((resolve, reject) => {
      model.save((err: any, result: IReview) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static update(id: string, update: any): Promise<IReview> {
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

  static findById(id: string): Promise<IReview> {
    return new Promise<IReview>((resolve, reject) => {
      Review.findById(id, (err: any, result: IReview) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(ReviewModel);
