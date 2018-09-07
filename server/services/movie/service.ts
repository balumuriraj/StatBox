import { IMovie, MovieModel } from "./model";

async function generateMoviesData(movies: IMovie[]) {
  const result: any[] = [];

  for (const movie of movies) {
    const resultMovie = await generateMovieData(movie);
    result.push(resultMovie);
  }

  return result;
}

async function generateMovieData(movie: IMovie) {
  return {
    id: movie._id,
    title: movie.title,
    description: movie.description,
    cert: movie.cert,
    poster: movie.poster,
    genre: movie.genre,
    runtime: movie.runtime,
    releasedate: movie.releasedate,
    rating: movie.rating
  };
}

export async function findMovieById(id: number) {
  const movie = await MovieModel.findById(id);
  return await generateMovieData(movie);
}

export async function findMoviesCountByDate(year: number, month?: number, day?: number) {
  const fields: any = {
    year: { $year: "$releasedate" }
  };
  const where: any = year && { year };
  const group: any = {
    _id: { year: "$year" },
    count: { $sum: 1 }
  };

  if (month) {
    fields.month = { $month: "$releasedate" };
    where.month = month;
    group._id.month = "$month";
  }

  if (day) {
    fields.day = { $dayOfMonth: "$releasedate" };
    where.day = day;
    group._id.day = "$day";
  }

  const query = [
    { $project: fields },
    { $match: where },
    { $group: group }
  ];

  const results = await MovieModel.aggregate(query);
  return results;
}

export async function findMoviesByDate(year: number, month?: number, day?: number) {
  const fields: any = {
    year: { $year: "$releasedate" }
  };
  const where: any = { year };

  if (month) {
    fields.month = { $month: "$releasedate" };
    where.month = month;
  }

  if (day) {
    fields.day = { $dayOfMonth: "$releasedate" };
    where.day = day;
  }

  const query = [
    { $addFields: fields },
    { $match: where }
  ];
  const movies = await MovieModel.aggregate(query);
  return await generateMoviesData(movies);
}

export async function findMoviesCountBetweenDates(date1: any, date2: any) {
  const query = [
    {
      $match: {
        releasedate: {
          $gte: date1,
          $lt: date2
        }
      }
    },
    { $count: "count" }
  ];

  const results = await MovieModel.aggregate(query);
  return results;
}

export async function findMoviesBetweenDates(date1: any, date2: any) {
  const query = {
    releasedate: {
      $gte: date1,
      $lt: date2
    }
  };

  const movies = await MovieModel.find(query);
  return await generateMoviesData(movies);
}