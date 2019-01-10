import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface IReview extends Document {
  userId: number;
  movieId: number;
  rating: number;
  watchWith: "friends" | "self" | "family";
  pace: "slow" | "fast";
  rewatch: "yes" | "no";
  story: "simple" | "complex";
  timestamp: number;
}

const reviewSchema = new Schema({
  userId: Number,
  movieId: Number,
  rating: Number,
  watchWith: String,
  pace: String,
  rewatch: String,
  story: String,
  timestamp: Number
});

reviewSchema.plugin(autoIncrement.plugin, { model: "Review", startAt: 1 });
reviewSchema.index({userId: 1}, {unique: false});
reviewSchema.index({movieId: 1}, {unique: false});
reviewSchema.index({movieId: 1, userId: 1}, {unique: true});
reviewSchema.index({timestamp: 1}, {unique: false});

const Review = mongoose.model<IReview>("Review", reviewSchema, "Reviews");

Review.schema.path("rating").validate((value) => {
  return value === null || value > 0 || value <= 5;
}, "Invalid rating value");

Review.schema.path("watchWith").validate((value) => {
  return /friends|self|family/i.test(value);
}, "Invalid watchWith value");

Review.schema.path("pace").validate((value) => {
  return /slow|fast/i.test(value);
}, "Invalid pace value");

Review.schema.path("rewatch").validate((value) => {
  return /yes|no/i.test(value);
}, "Invalid rewatch value");

Review.schema.path("story").validate((value) => {
  return /simple|complex/i.test(value);
}, "Invalid story value");

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

  static update(query: any, update: any): Promise<IReview> {
    const options =  {upsert: true, new: true, runValidators: true };

    return new Promise<IReview>((resolve, reject) => {
      // Review.findOneAndUpdate(query, update, options, (err: any, result: IReview) => {
      //   console.log(err, result);

      //   if (err) {
      //     reject(err);
      //   }

      //   resolve(result);
      // });

      Review.findOne(query, (err: any, result: IReview) => {
        if (err) {
          reject(err);
        }

        if (result) {
          Review.findByIdAndUpdate(result._id, update, (err: any, result: IReview) => {
            if (err) {
              reject(err);
            }

            resolve(result);
          });
        } else {
          const model = new Review(update);
          model.save((err: any, result: IReview) => {
            if (err) {
              reject(err);
            }

            resolve(result);
          });
        }
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
