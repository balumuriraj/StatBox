import * as jsonGraph from "falcor-json-graph";
import { findGenresByIds, findGenresCount, findMovieCountByGenreId } from "../../services/genre/service";

const $ref = jsonGraph.ref;
const $atom = jsonGraph.atom;

async function getGenreListNames(params: any) {
  const { genreIds } = params;
  const keys = params[2];
  const results: any[] = [];

  const genres = await findGenresByIds(genreIds);

  genres.forEach((genre) => {
    for (const key of keys) {
      results.push({
        path: ["genresById", genre.id, key],
        value: genre[key] || null
      });
    }
  });

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

  const genres = await findGenresByIds(genreIds);

  genres.forEach((genre) => {
    for (const movieIndex of movieIndices) {
      const movieId = genre.movieIds[movieIndex];

      results.push({
        path: ["genresById", genre.id, key, movieIndex],
        value: movieId ? $ref(["moviesById", movieId]) : null
      });
    }

    results.push({
      path: ["genresById", genre.id, key, "length"],
      value: genre.movieIds.length
    });
  });

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
