import { IMovie, MovieModel } from "./model";

async function generateData(movies: IMovie[]) {
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
    name: movie.name,
    poster: movie.poster,
    genre: movie.genre,
    runtime: movie.runtime,
    releasedate: movie.releasedate
  };
}

export async function getMovieById(id: string) {
  const movie = await MovieModel.findById(id);
  return await generateMovieData(movie);
}

export async function getMovieByYear(year: number) {
  const fields = {
    year: { $year: "$date" }
  };
  const where = { year };
  const movies = await MovieModel.aggregate(fields, where);
  return await generateData(movies);
}
