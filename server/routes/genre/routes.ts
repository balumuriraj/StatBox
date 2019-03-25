import * as jsonGraph from "falcor-json-graph";
import { findGenresByIds, findGenresCount, findMovieCountByGenreId } from "../../services/genre/service";
import { sortMovieIds } from "../../services/movie/service";

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

async function getSortedGenreListMovies(params: any) {
  const { genreIds, movieIndices } = params;
  const sorts = params[2];
  const results: any[] = [];
  const genres = await findGenresByIds(genreIds);

  console.log("working...");

  for (const sortBy of sorts) {
    for (const genre of genres) {
      const limit = movieIndices.length;
      const skip = movieIndices[0];
      const sortedMovieIds = await sortMovieIds(genre.movieIds, sortBy, limit, skip);

      for (const index in movieIndices) {
        const movieId = sortedMovieIds[index];
        const movieIndex = movieIndices[index];

        results.push({
          path: ["genresById", genre.id, sortBy, movieIndex],
          value: movieId ? $ref(["moviesById", movieId]) : null
        });
      }

      results.push({
        path: ["genresById", genre.id, sortBy, "length"],
        value: genre.movieIds.length
      });
    }
  }

  console.log(results);

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
  },
  {
    route: "genresById[{integers:genreIds}]['releasedate','title','rating'][{integers:movieIndices}]",
    get: getSortedGenreListMovies
  }
];
