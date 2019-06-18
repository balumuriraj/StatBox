import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface IVote extends Document {
  pollId: number;
  userId: number;
  movieId: number;
  timestamp: number;
}

const voteSchema = new Schema({
  pollId: Number,
  userId: Number,
  movieId: Number,
  timestamp: Number
});

voteSchema.plugin(autoIncrement.plugin, { model: "Vote", startAt: 1 });

const Vote = mongoose.model<IVote>("Vote", voteSchema, "Votes");

export class VoteModel {
  constructor() {}

  static create(props?: any): Promise<number> {
    const model = new Vote(props);

    return new Promise<number>((resolve, reject) => {
      model.save((err: any, result: IVote) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static delete(query: any): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      Vote.deleteOne(query, (err: any) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }

  static update(query: any, update: any): Promise<IVote> {
    return new Promise<IVote>((resolve, reject) => {
      // Vote.findOneAndUpdate(query, update, options, (err: any, result: IVote) => {
      //   console.log(err, result);

      //   if (err) {
      //     reject(err);
      //   }

      //   resolve(result);
      // });

      Vote.findOne(query, (err: any, result: IVote) => {
        if (err) {
          reject(err);
        }

        if (result) {
          Vote.findByIdAndUpdate(result._id, update, (err: any, result: IVote) => {
            if (err) {
              reject(err);
            }

            resolve(result);
          });
        } else {
          const model = new Vote(update);
          model.save((err: any, result: IVote) => {
            if (err) {
              reject(err);
            }

            resolve(result);
          });
        }
      });
    });
  }

  static find(query: any[] = [], sort?: any, limitCount?: number, skipCount?: number): Promise<IVote[]> {
    return new Promise<IVote[]>((resolve, reject) => {
      Vote.find(...query).sort(sort).limit(limitCount).skip(skipCount).exec((err: any, result: IVote[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: number): Promise<IVote> {
    return new Promise<IVote>((resolve, reject) => {
      Vote.findById(id, (err: any, result: IVote) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static aggregate(query: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      Vote.aggregate(query, (err: any, result: any[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(VoteModel);
