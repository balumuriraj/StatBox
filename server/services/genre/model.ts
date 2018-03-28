import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface IGenre extends Document {
  name: string;
  movieIds: [number];
}

const genreSchema = new Schema({
  name: String,
  movieIds: [Number]
});

genreSchema.plugin(autoIncrement.plugin, { model: "Genre", startAt: 1 });

const Genre = mongoose.model<IGenre>("Genre", genreSchema, "Genres");

export class GenreModel {
  constructor() {}

  static create(props?: any): Promise<number> {
    const model = new Genre(props);

    return new Promise<number>((resolve, reject) => {
      model.save((err: any, result: IGenre) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static update(id: number, update: any): Promise<IGenre> {
    return new Promise<IGenre>((resolve, reject) => {
      Genre.findByIdAndUpdate(id, update, (err: any, result: IGenre) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static find(query: any = {}): Promise<IGenre[]> {
    return new Promise<IGenre[]>((resolve, reject) => {
      Genre.find(query, (err: any, result: IGenre[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: number): Promise<IGenre> {
    return new Promise<IGenre>((resolve, reject) => {
      Genre.findById(id, (err: any, result: IGenre) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static aggregate(query: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      Genre.aggregate(query, (err: any, result: any[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(GenreModel);
