import * as dateFormat from "dateformat";
import * as jsonGraph from "falcor-json-graph";
import { findMoviesBetweenDates, findMoviesByIds, findMoviesCountBetweenDates } from "../../services/movie/service";
import { findRatingBinsByMovieId, findRatingsByMovieIds, findReviewBinsByMovieId, findUserReviewsByMovieIds } from "../../services/review/service";
import { findRolesByMovieIds } from "../../services/role/service";
import { findUserById } from "../../services/user/service";

const $ref = jsonGraph.ref;
const $atom = jsonGraph.atom;

async function getMoviesByIds(pathSet: any) {
  const { movieIds } = pathSet;
  const results: any[] = [];
  const props = pathSet[2] ||
    ["id", "title", "cert", "releaseDate", "poster", "runtime", "genre", "rating", "ratingsCount"];

  const movies = await findMoviesByIds(movieIds);

  let ratingsByMovieIds = {};

  if (props.indexOf("rating") > -1) {
    ratingsByMovieIds = await findRatingsByMovieIds(movieIds);
  }

  movies.forEach((movie) => {
    const movieId = movie.id;

    for (const prop of props) {
      let value: any = movie[prop];

      if (prop === "releaseDate") {
        const dateStr = movie["releasedate"];
        const date = new Date(dateStr);
        value = dateFormat(date, "mediumDate");
      } else if (prop === "genre") {
        value = $atom(value);
      } else if (prop === "rating") {
        value = ratingsByMovieIds[movieId] && ratingsByMovieIds[movieId].rating;
      } else if (prop === "ratingsCount") {
        value = ratingsByMovieIds[movieId] && ratingsByMovieIds[movieId].count;
      }

      results.push({
        path: ["moviesById", movieId, prop],
        value: value || null
      });
    }
  });

  return results;
}

async function getMoviesMetadataByIds(pathSet: any) {
  const { movieIds } = pathSet;
  const results: any[] = [];
  const prop = pathSet[2];
  const keys = pathSet[3] || ["cast", "crew", "ratingBins", "attributes", "isBookmarked", "isFavorite", "userReview"];

  const userId = this.userId;
  let userInfo = null;
  const userReviewsByMovieIds = {};

  if (userId) {
    if (keys.indexOf("isBookmarked") > -1 || keys.indexOf("isFavorite") > -1) {
      userInfo = await findUserById(userId);
    }

    if (keys.indexOf("userReview") > -1) {
      const userReviews = await findUserReviewsByMovieIds(userId, movieIds);
      userReviews.forEach((userReview) => userReviewsByMovieIds[userReview.movieId] = userReview);
    }
  }

  let castRoles: any;
  let crewRoles: any;

  if (keys.indexOf("cast") > -1) {
    castRoles = await findRolesByMovieIds(movieIds, "cast");
  }

  if (keys.indexOf("crew") > -1) {
    crewRoles = await findRolesByMovieIds(movieIds, "crew");
  }

  for (const movieId of movieIds) {
    for (const key of keys) {
      let value = null;

      if (key === "cast") {
        const roles = castRoles.filter((castRole) => castRole.movieId === movieId);
        roles.forEach((role, idx) => {
          results.push({
            path: ["moviesById", movieId, prop, key, idx],
            value: role.id ? $ref(["rolesById", role.id]) : null
          });
        });
      } else if (key === "crew") {
        const roles = crewRoles.filter((crewRole) => crewRole.movieId === movieId);
        roles.forEach((role, idx) => {
          results.push({
            path: ["moviesById", movieId, prop, key, idx],
            value: role.id ? $ref(["rolesById", role.id]) : null
          });
        });
      }
      else {
        if (key === "ratingBins") {
          value = await findRatingBinsByMovieId(movieId);
          value = $atom(value);
          value.$expires = -300000; // expires in 5 mins
        } else if (key === "attributes") {
          value = await findReviewBinsByMovieId(movieId);
          value = $atom(value);
          value.$expires = -300000; // expires in 5 mins
        } else if (key === "isBookmarked") {
          value = userInfo && userInfo["bookmarks"].indexOf(movieId) > -1;
          value = $atom(value);
          value.$expires = 0; // expire immediately
        } else if (key === "isFavorite") {
          value = userInfo && userInfo["favorites"].indexOf(movieId) > -1;
          value = $atom(value);
          value.$expires = 0; // expire immediately
        } else if (key === "userReview") {
          value = userReviewsByMovieIds[movieId] || { rating: null, watchWith: null, pace: null, story: null, rewatch: null };
          value = $atom(value);
          value.$expires = 0; // expire immediately
        }

        results.push({
          path: ["moviesById", movieId, prop, key],
          value
        });
      }
    }
  }

  return results;
}

async function searchMoviesCountByQuery(pathSet: any) {
  const { queryStrings } = pathSet;
  const prop = pathSet[2] || "length";
  const query: any = {};
  const results = [];

  for (const queryString of queryStrings) {
    queryString.split("&").forEach((str) => {
      const arr = str.split("=");
      query[arr[0]] = arr[1];
    });

    const { date1, date2 } = query;
    const moviesCount = await findMoviesCountBetweenDates(Number(date1), Number(date2));

    results.push({
      path: ["moviesSearches", queryString, prop],
      value: moviesCount
    });
  }

  return results;
}

async function searchMoviesByQuery(pathSet: any) {
  const { queryStrings, indices } = pathSet;
  const query: any = {};
  const results = [];

  for (const queryString of queryStrings) {
    queryString.split("&").forEach((str) => {
      const arr = str.split("=");
      query[arr[0]] = arr[1];
    });

    const { date1, date2 } = query;
    const limit = indices.length;
    const skip = indices[0];
    const movies = await findMoviesBetweenDates(Number(date1), Number(date2), limit, skip);

    for (let i = 0; i < movies.length; i++) {
      const index = indices[i];
      const movie = movies[i];

      let value: any = null;
      const movieId = movie.id;

      if (movieId) {
        value = $ref(["moviesById", movieId]);
      }

      results.push({
        path: ["moviesSearches", queryString, index],
        value
      });
    }
  }

  return results;
}

export default [
  {
    route: "moviesById[{integers:movieIds}]",
    get: getMoviesByIds
  },
  {
    route: "moviesById[{integers:movieIds}]['id', 'title', 'description', 'cert', 'releaseDate', 'poster', 'runtime', 'genre', 'rating', 'ratingsCount']",
    get: getMoviesByIds
  },
  {
    route: "moviesById[{integers:movieIds}].metadata['cast', 'crew', 'ratingBins', 'attributes', 'isBookmarked', 'isFavorite', 'userReview']",
    get: getMoviesMetadataByIds
  },
  {
    route: "moviesSearches[{keys:queryStrings}].length",
    get: searchMoviesCountByQuery
  },
  {
    route: "moviesSearches[{keys:queryStrings}][{integers:indices}]",
    get: searchMoviesByQuery
  }
];
