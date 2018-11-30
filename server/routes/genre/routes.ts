import * as jsonGraph from "falcor-json-graph";
import { findGenreById, findGenresCount, findMovieCountByGenreId } from "../../services/genre/service";

const $ref = jsonGraph.ref;
const $atom = jsonGraph.atom;

async function getGenreListNames(params: any) {
  const { genreIds } = params;
  const keys = params[2];
  const results: any[] = [];

  for (const genreId of genreIds) {
    const genreData = await findGenreById(genreId);

    for (const key of keys) {
      results.push({
        path: ["genresById", genreId, key],
        value: genreData[key] || null
      });
    }
  }

  return results;
}

async function getGenreListLength(params: any) {
  const key = "length";
  const results: any[] = [];

  const count = await findGenresCount();

    results.push({
      path: ["genresById", key],
      value: count || null
    });

  return results;
}

async function getGenreListMovies(params: any) {
  const { genreIds, movieIndices } = params;
  const key = "movies";
  const results: any[] = [];

  for (const genreId of genreIds) {
    const genreData = await findGenreById(genreId);

    for (const movieIndex of movieIndices) {
      const movieId = genreData.movieIds[movieIndex];

      results.push({
        path: ["genresById", genreId, key, movieIndex],
        value: movieId ? $ref(["moviesById", movieId]) : null
      });
    }

    results.push({
      path: ["genresById", genreId, key, "length"],
      value: genreData.movieIds.length
    });
  }

  return results;
}

async function getGenreListMoviesLength(params: any) {
  const { genreIds } = params;
  const key = "movies";
  const results: any[] = [];

  for (const genreId of genreIds) {
    const count = await findMovieCountByGenreId(genreId);

    results.push({
      path: ["genresById", genreId, key, "length"],
      value: count
    });
  }

  return results;
}

export default [
  {
    route: "genresById[{integers:genreIds}]['id', 'name']",
    get: getGenreListNames
  },
  {
    route: "genresById.length",
    get: getGenreListLength
  },
  {
    route: "genresById[{integers:genreIds}].movies[{integers:movieIndices}]",
    get: getGenreListMovies
  },
  {
    route: "genresById[{integers:genreIds}].movies.length",
    get: getGenreListMoviesLength
  }
];
