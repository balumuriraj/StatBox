import * as dateFormat from "dateformat";
import * as jsonGraph from "falcor-json-graph";
import { findMovieById, findMoviesBetweenDates } from "../../services/movie/service";
import { findRolesByMovieId } from "../../services/role/service";

const $ref = jsonGraph.ref;
const $atom = jsonGraph.atom;

async function getMoviesByIds(pathSet: any) {
  const { movieIds } = pathSet;
  const results: any[] = [];
  const props = pathSet[2] || ["id", "title", "description", "cert", "releaseDate", "poster", "runtime", "genre", "cast", "crew"];

  for (const movieId of movieIds) {
    const movie = await findMovieById(movieId);

    for (const prop of props) {
      if (prop === "cast" || prop === "crew") {
        const roles = await findRolesByMovieId(movieId, prop);

        roles.forEach((role, index) => {
          results.push({
            path: ["moviesById", movieId, prop, index],
            value: role.id ? $ref(["rolesById", role.id]) : null
          });
        });
      } else {
        let value: any = movie[prop];

        if (prop === "releaseDate") {
          const dateStr = movie["releasedate"];
          const date = new Date(dateStr);
          value = dateFormat(date, "mediumDate");
        } else if (prop === "genre") {
          value = $atom(value);
        }

        results.push({
          path: ["moviesById", movieId, prop],
          value: value || null
        });
      }
    }
  }

  return results;
}

async function searchMoviesByQuery(pathSet: any) {
  const queryStrings = pathSet[1];
  const query: any = {};
  const results = [];

  for (const queryString of queryStrings) {
    queryString.split("&").forEach((str) => {
      const arr = str.split("=");
      query[arr[0]] = arr[1];
    });

    const { date1, date2 } = query;
    const movies = await findMoviesBetweenDates(Number(date1), Number(date2));
    console.log(queryString, movies.length);

    movies.forEach((movie, index) => {
      let value: any = null;
      const movieId = movie.id;

      if (movieId) {
        value = $ref(["moviesById", movieId]);
      }

      results.push({
        path: ["moviesSearches", queryString, index],
        value
      });
    });

    results.push({
      path: ["moviesSearches", queryString, "length"],
      value: movies.length
    });
  }

  return results;
}

export default [
  {
    route: "moviesById[{integers:movieIds}]",
    get: getMoviesByIds
  },
  {
    route: "moviesSearches[{keys:query}]",
    get: searchMoviesByQuery
  }
];
