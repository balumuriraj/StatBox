import * as dateFormat from "dateformat";
import * as jsonGraph from "falcor-json-graph";
import { findMoviesByDate, findMoviesByFilter, findMoviesByFilterCount, findMoviesByIds, findMoviesCountByDate, findMoviesCountByYears } from "../../../services/movie/service";
import { findRatingBinsByMovieId, findReviewBinsByMovieId, findUserReviewsByMovieIds } from "../../../services/review/service";
import { findRolesByMovieIds } from "../../../services/role/service";
import { findUserById } from "../../../services/user/service";

const $ref = jsonGraph.ref;
const $atom = jsonGraph.atom;

async function getMoviesByIds(pathSet: any) {
  const { movieIds } = pathSet;
  const results: any[] = [];
  const props = pathSet[2] ||
    ["id", "title", "cert", "releaseDate", "poster", "runtime", "genre", "rating", "ratingsCount"];
  const movies = await findMoviesByIds(movieIds, props.indexOf("rating") > -1);

  for (const movie of movies) {
    const movieId = movie.id;

    for (const prop of props) {
      let value: any = movie[prop];

      if (prop === "releaseDate") {
        const dateStr = movie["releaseDate"];
        const date = new Date(dateStr);
        value = dateFormat(date, "mediumDate");
      } else if (prop === "genre") {
        value = $atom(value);
      } else if (prop === "rating") {
        value = $atom(movie.rating);
        value.$expires = 0; // expire immediately
      } else if (prop === "ratingsCount") {
        value = $atom(movie.ratingsCount);
        value.$expires = 0; // expire immediately
      }

      results.push({
        path: ["moviesById", movieId, prop],
        value: value || null
      });
    }
  }

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

async function getMoviesCountByYears(pathSet: any) {
  const moviesCount = await findMoviesCountByYears();
  return [{
    path: ["moviesCountByYears"],
    value: $atom(moviesCount)
  }];
}

async function getMoviesByYearsCount(pathSet: any) {
  const { years } = pathSet;
  const results = [];

  for (const year of years) {
    const moviesCount = await findMoviesCountByDate([year]);

    return [{
      path: ["moviesByYear", year, "length"],
      value: $atom(moviesCount)
    }];
  }

  return results;
}

async function getMoviesByYears(pathSet: any) {
  const { years, indices } = pathSet;
  const results = [];

  for (const year of years) {
    const limit = indices.length;
    const skip = indices[0];
    const movies = await findMoviesByDate([year], limit, skip);

    for (let i = 0; i < movies.length; i++) {
      const index = indices[i];
      const movie = movies[i];

      let value: any = null;
      const movieId = movie.id;

      if (movieId) {
        value = $ref(["moviesById", movieId]);
      }

      results.push({
        path: ["moviesByYear", year, index],
        value
      });
    }
  }

  return results;
}

async function getMoviesByFiltersCount(pathSet: any) {
  const { filters } = pathSet;
  const prop = pathSet[2] || "length";
  const query: any = {};
  const results = [];

  for (const filter of filters) {
    filter.split("&").forEach((str) => {
      const arr = str.split("=");
      query[arr[0]] = arr[1].split(",").filter(Boolean);
    });

    const moviesCount = await findMoviesByFilterCount(query.genres, query.years.map(Number));

    results.push({
      path: ["moviesByFilter", filter, prop],
      value: moviesCount
    });
  }

  return results;
}


async function getMoviesByFilters(pathSet: any) {
  const { filters, indices } = pathSet;
  const query: any = {};
  const results = [];

  for (const filter of filters) {
    filter.split("&").forEach((str) => {
      const arr = str.split("=");
      query[arr[0]] = arr[1].split(",").filter(Boolean);
    });

    const limit = indices.length;
    const skip = indices[0];
    const movieIds = await findMoviesByFilter(query.genres, query.years.map(Number), query.sortBy[0], limit, skip);
    // console.log("skip: ", skip, " limit: ", limit, "movieIds: ", movieIds);

    for (let i = 0; i < movieIds.length; i++) {
      const index = indices[i];
      const movieId = movieIds[i];

      let value: any = null;

      if (movieId) {
        value = $ref(["moviesById", movieId]);
      }

      results.push({
        path: ["moviesByFilter", filter, index],
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
    route: "moviesCountByYears",
    get: getMoviesCountByYears
  },
  {
    route: "moviesByYear[{integers:years}].length",
    get: getMoviesByYearsCount
  },
  {
    route: "moviesByYear[{integers:years}][{integers:indices}]",
    get: getMoviesByYears
  },
  {
    route: "moviesByFilter[{keys:filters}].length",
    get: getMoviesByFiltersCount
  },
  {
    route: "moviesByFilter[{keys:filters}][{integers:indices}]",
    get: getMoviesByFilters
  }
];
