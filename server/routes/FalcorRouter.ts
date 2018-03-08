import * as jsonGraph from "falcor-json-graph";
import * as Router from "falcor-router";
import { findMovieById, findMoviesByDate, findMoviesCountByDate } from "../services/movie/service";

const $ref = jsonGraph.ref;

async function getMoviesByIds(params: any) {
  const { movieIds } = params;
  const keys = params[2];
  const results: any[] = [];

  for (const movieId of movieIds) {
    const movie = await findMovieById(movieId);

    for (const key of keys) {
      let value: any = movie[key];

      if (key === "year") {
        const dateStr = movie["releasedate"];
        const date = new Date(dateStr);
        value = date.getFullYear();
      }

      results.push({
        path: ["moviesById", movieId, key],
        value: value || null
      });
    }
  }

  return results;
}

async function getMoviesCountByYears(params: any) {
  const { years } = params;
  const results: any[] = [];

  for (const year of years) {
    const rows = await findMoviesCountByDate(year);
    let value = rows && rows[0] && rows[0].count;

    if (value == null) {
      value = null;
    }

    results.push({
      path: ["moviesByYear", year, "movies", "length"],
      value
    });
  }

  return results;
}

async function getMoviesByYears(params: any) {
  const { years, movieIndices } = params;
  const results: any[] = [];

  for (const year of years) {
    const movies = await findMoviesByDate(year);

    if (!movies.length) {
      results.push({
        path: ["moviesByYear", year],
        value: null
      });
    }
    else {
      for (const movieIndex of movieIndices) {
        let value: any = null;
        const movie = movies[movieIndex];
        const movieId = movie && movie.id;

        if (movieId) {
          value = $ref(["moviesById", movieId]);
        }

        results.push({
          path: ["moviesByYear", year, "movies", movieIndex],
          value
        });
      }
    }
  }

  return results;
}

async function getMoviesCountByYearsMonths(params: any) {
  const { years, months } = params;
  const results: any[] = [];

  for (const year of years) {
    for (const month of months) {
      const rows = await findMoviesCountByDate(year, month);
      let value = rows && rows[0] && rows[0].count;

      console.log(year, month, value);

      if (value == null) {
        value = null;
      }

      results.push({
        path: ["moviesByYearMonth", year, month, "movies", "length"],
        value
      });
    }
  }

  return results;
}

async function getMoviesByYearsMonths(params: any) {
  const { years, months, movieIndices } = params;
  const results: any[] = [];

  for (const year of years) {
    for (const month of months) {
      const movies = await findMoviesByDate(year, month);

      if (!movies.length) {
        results.push({
          path: ["moviesByYearMonth", year, month],
          value: null
        });
      }
      else {
        for (const movieIndex of movieIndices) {
          let value: any = null;
          const movie = movies[movieIndex];
          const movieId = movie && movie.id;

          if (movieId) {
            value = $ref(["moviesById", movieId]);
          }

          results.push({
            path: ["moviesByYearMonth", year, month, "movies", movieIndex],
            value
          });
        }
      }
    }
  }

  return results;
}

/*
{
  moviesById: {
    234: {
      name: "Khaidi No. 150",
      year: 2017,
      poster: "url",
      runtime: 150,
      rating: 3
    },
    // more
  },
  moviesByYear: {
    2017 : {
      movies: [
        { $type: "ref", value: ["moviesById", 234] },
        // more
      ]
    },
    // more
  },
  moviesByYearMonth: {
    2017: {
      1: {
        movies: [
          { $type: "ref", value: ["moviesById", 234] },
          // more
        ]
      },
      // more
    },
    // more
  }
}
*/

const FalcorRouter = Router.createClass([
  {
    route: "moviesById[{integers:movieIds}]['name','year','poster','runtime','rating']",
    get: getMoviesByIds
  },
  {
    route: "moviesByYear[{integers:years}].movies.length",
    get: getMoviesCountByYears
  },
  {
    route: "moviesByYear[{integers:years}].movies[{integers:movieIndices}]",
    get: getMoviesByYears
  },
  {
    route: "moviesByYearMonth[{integers:years}][{integers:months}].movies.length",
    get: getMoviesCountByYearsMonths
  },
  {
    route: "moviesByYearMonth[{integers:years}][{integers:months}].movies[{integers:movieIndices}]",
    get: getMoviesByYearsMonths
  }
]);

export default new FalcorRouter();
