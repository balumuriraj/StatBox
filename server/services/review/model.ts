import { Document, Schema } from "mongoose";
import { mongoose } from "../../config/database";
import { CounterModel } from "../counter/model";

export interface IReview extends Document {
  reviewId: number;
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
  reviewId: Number,
  userId: Number,
  movieId: Number,
  rating: Number,
  watchWith: String,
  pace: String,
  rewatch: String,
  story: String,
  timestamp: Number
});
reviewSchema.index({reviewId: 1}, {unique: true});
reviewSchema.pre("save", async function(next) {
  const result = await CounterModel.findOneAndUpdate({ name: "Review", field: "reviewId" });
  (this as any).reviewId = result.count;
  next();
});

reviewSchema.index({userId: 1}, {unique: false});
reviewSchema.index({movieId: 1}, {unique: false});
reviewSchema.index({movieId: 1, userId: 1}, {unique: true});
reviewSchema.index({timestamp: 1}, {unique: false});

const Review = mongoose.model<IReview>("Review", reviewSchema, "Reviews");

Review.schema.path("rating").validate((value) => {
  return value === null || value > 0 || value <= 5;
}, "Invalid rating value");

Review.schema.path("watchWith").validate((value) => {
  return /friends|self|family/i.test(value) || value === null;
}, "Invalid watchWith value");

Review.schema.path("pace").validate((value) => {
  return /slow|fast/i.test(value) || value === null;
}, "Invalid pace value");

Review.schema.path("rewatch").validate((value) => {
  return /yes|no/i.test(value) || value === null;
}, "Invalid rewatch value");

Review.schema.path("story").validate((value) => {
  return /simple|complex/i.test(value) || value === null;
}, "Invalid story value");

export class ReviewModel {
  constructor() {}

  static async create(props?: any): Promise<IReview> {
    const model = new Review(props);
    return model.save();
  }

  static async findAndUpdate(query: any, update: any): Promise<IReview> {
    const result = await Review.findOne(query).exec();

    if (result) {
      return await Review.findByIdAndUpdate(result._id, update).exec();
    }

    return this.create(update);
  }

  static async find(query: any[] = [], sort?: any, limitCount?: number, skipCount?: number): Promise<IReview[]> {
    return Review.find(...query).sort(sort).limit(limitCount).skip(skipCount).exec();
  }

  static async findById(reviewId: number): Promise<IReview> {
    return Review.findOne({ reviewId }).exec();
  }

  static async aggregate(query: any): Promise<any[]> {
    return Review.aggregate(query).allowDiskUse(true).exec();
  }

  static async deleteMany(query: any): Promise<any> {
    return Review.deleteMany(query).exec();
  }

  static async deleteOne(query: any): Promise<any> {
    return Review.deleteOne(query).exec();
  }
}

Object.seal(ReviewModel);
