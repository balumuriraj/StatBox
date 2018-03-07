import * as Router from "falcor-router";
import { getMovieById, getMovieByYear } from "../services/movie/service";

async function getMoviesById(params: any) {
  console.log(params);
  const { years } = params;
  const keys = params[2];
  const results: any[] = [];

  for (const year of years) {
    const movie = await getMovieByYear(year);

    for (const key of keys) {
      results.push({
        path: ["moviesByYear", year, key],
        value: movie[key]
      });
    }
  }

  return results;
}

const FalcorRouter = Router.createClass([
  {
    route: "moviesById[{integers:movieIds}]['name','poster','runtime']",
    async get(pathSet: any) {
      const { movieIds } = pathSet;
      const keys = pathSet[2];
      const results: any[] = [];

      console.log(pathSet);

      for (const movieId of movieIds) {
        const movie = await getMovieById(movieId);

        for (const key of keys) {
          results.push({
            path: ["moviesById", movieId, key],
            value: movie[key]
          });
        }
      }

      console.log(results);

      return results;
    }
  }
]);

export default new FalcorRouter();
