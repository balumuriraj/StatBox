import * as dateFormat from "dateformat";
import * as jsonGraph from "falcor-json-graph";
import { findMovieById, findMoviesBetweenDates, findMoviesByDate, findMoviesCountBetweenDates, findMoviesCountByDate } from "../../services/movie/service";

const $ref = jsonGraph.ref;
const $atom = jsonGraph.atom;

async function getMoviesByIds(params: any) {
  const { movieIds } = params;
  const keys = params[2];
  const results: any[] = [];

  for (const movieId of movieIds) {
    const movie = await findMovieById(movieId);

    for (const key of keys) {
      let value: any = movie[key];

      if (key === "date") {
        const dateStr = movie["releasedate"];
        const date = new Date(dateStr);
        value = dateFormat(date, "mediumDate");
      }

      if (key === "genre" || key === "castIds" || key === "crewIds") {
        value = $atom(value);
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

async function getMoviesCountByYearsMonthsdays(params: any) {
  const { years, months, days } = params;
  const results: any[] = [];

  for (const year of years) {
    for (const month of months) {
      for (const day of days) {
        const rows = await findMoviesCountByDate(year, month, day);
        let value = rows && rows[0] && rows[0].count;

        if (value == null) {
          value = null;
        }

        results.push({
          path: ["moviesByYearMonthDay", year, month, day, "movies", "length"],
          value
        });
      }
    }
  }

  return results;
}

async function getMoviesByYearsMonthsdays(params: any) {
  const { years, months, days, movieIndices } = params;
  const results: any[] = [];

  for (const year of years) {
    for (const month of months) {
      for (const day of days) {
        const movies = await findMoviesByDate(year, month, day);

        if (!movies.length) {
          results.push({
            path: ["moviesByYearMonthDay", year, month, day],
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
              path: ["moviesByYearMonthDay", year, month, day, "movies", movieIndex],
              value
            });
          }
        }
      }
    }
  }

  return results;
}

async function getMoviesCountBetweenDates(params: any) {
  const { dates1, dates2 } = params;
  const date1 = dates1[0];
  const date2 = dates2[0];
  const results: any[] = [];

  const rows = await findMoviesCountBetweenDates(date1, date2);
  let value = rows && rows[0] && rows[0].count;

  if (value == null) {
    value = null;
  }

  results.push({
    path: ["moviesCountBetweenDates", date1, date2, "movies", "length"],
    value
  });

  return results;
}

async function getMoviesBetweenDates(params: any) {
  const { dates1, dates2, movieIndices } = params;
  const date1 = dates1[0];
  const date2 = dates2[0];
  const results: any[] = [];

  const movies = await findMoviesBetweenDates(date1, date2);

  if (!movies.length) {
    results.push({
      path: ["moviesBetweenDates", date1, date2],
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
        path: ["moviesBetweenDates", date1, date2, "movies", movieIndex],
        value
      });
    }
  }

  return results;
}

export default [
  {
    route: "moviesById[{integers:movieIds}]['id','title','description','cert', 'date','poster','runtime','genre']",
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
  },
  {
    route: "moviesByYearMonthDay[{integers:years}][{integers:months}][{integers:days}].movies.length",
    get: getMoviesCountByYearsMonthsdays
  },
  {
    route: "moviesByYearMonthDay[{integers:years}][{integers:months}][{integers:days}].movies[{integers:movieIndices}]",
    get: getMoviesByYearsMonthsdays
  },
  {
    route: "moviesCountBetweenDates[{integers:dates1}][{integers:dates2}].movies.length",
    get: getMoviesCountBetweenDates
  },
  {
    route: "moviesBetweenDates[{integers:dates1}][{integers:dates2}].movies[{integers:movieIndices}]",
    get: getMoviesBetweenDates
  }
];
