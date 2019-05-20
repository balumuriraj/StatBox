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
    releasedate: movie.releasedate
  };
}

export async function findMoviesByIds(ids: number[]) {
  const query = [{ _id: { $in: ids } }];
  const movies = await MovieModel.find(query);
  return await generateMoviesData(movies);
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
          $gte: new Date(date1),
          $lt: new Date(date2)
        }
      }
    },
    { $count: "count" }
  ];

  const results = await MovieModel.aggregate(query);
  return results && results[0] && results[0].count || 0;
}

export async function findMoviesBetweenDates(date1: any, date2: any, limit: number, skip: number) {
  const query = [
    {
      releasedate: {
        $gte: new Date(date1),
        $lt: new Date(date2)
      }
    }
  ];

  const sort = { releasedate: -1 };

  const movies = await MovieModel.find(query, sort, limit, skip);
  return await generateMoviesData(movies);
}

export async function sortMovieIds(ids: number[], sortBy: string, limit: number, skip: number) {
  const query = [
    {
      _id : { $in : ids }
    },
    {
      _id: 1
    }
  ];
  const sort = {};
  sort[sortBy] = 1; // ascending order

  const movies = await MovieModel.find(query, sort, limit, skip);
  return movies.map((movie) => movie._id);
}

// Full text search
export async function findMoviesByTerm(term: string) {
  const query = [
    { $text: { $search: term } },
    { score: { $meta: "textScore" } }
  ];
  const sort = { score: { $meta: "textScore" } };
  const movies = await MovieModel.find(query, sort, 10);
  return await generateMoviesData(movies);
}

export async function findAllMovies() {
  const query = [];
  const movies = await MovieModel.find(query);
  return await generateMoviesData(movies);
}

export async function findMoviesCountByYears() {
  const fields: any = {
    year: { $year: "$releasedate" }
  };
  const group: any = {
    _id: { year: "$year" },
    count: { $sum: 1 }
  };
  const query = [
    { $addFields: fields },
    { $group: group }
  ];

  const results = await MovieModel.aggregate(query);
  const bins = {};

  if (results) {
    results.forEach((result) => {
      const rating = result._id.year;

      if (rating) {
        bins[rating] = result.count;
      }
    });
  }

  return bins;
}
