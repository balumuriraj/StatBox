import * as dateFormat from "dateformat";
import * as jsonGraph from "falcor-json-graph";
import { findMoviesBetweenDates, findMoviesByIds } from "../../services/movie/service";
import { findReviewsByMovieIds, findUserReviewsByMovieIds } from "../../services/review/service";
import { findRolesByMovieIds } from "../../services/role/service";
import { findUserById } from "../../services/user/service";

const $ref = jsonGraph.ref;
const $atom = jsonGraph.atom;

async function getMoviesByIds(pathSet: any) {
  const { movieIds } = pathSet;
  const results: any[] = [];
  const props = pathSet[2] ||
    [
      "id", "title", "description", "cert", "releaseDate", "poster", "runtime", "genre", "cast", "crew", "rating"
    ];

  const movies = await findMoviesByIds(movieIds);
  const castRoles = await findRolesByMovieIds(movieIds, "cast");
  const crewRoles = await findRolesByMovieIds(movieIds, "crew");
  const reviewsByMovieIds = await findReviewsByMovieIds(movieIds);

  movies.forEach((movie, index) => {
    const movieId = movie.id;

    for (const prop of props) {
      if (prop === "cast" || prop === "crew") {
        let roles = null;

        if (prop === "cast") {
          roles = castRoles.filter((castRole) => castRole.movieId === movieId);
        } else {
          roles = crewRoles.filter((crewRole) => crewRole.movieId === movieId);
        }

        roles.forEach((role, idx) => {
          results.push({
            path: ["moviesById", movieId, prop, idx],
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
        } else if (prop === "rating") {
          // TODO: update this
          const reviews = reviewsByMovieIds.filter((review) => review.movieId === movieId);

          if (reviews && reviews.length) {
            const ratings = reviews.map((review) => review.rating);
            value = ratings.reduce((a, b) => a + b) / ratings.length;
          }
        }

        results.push({
          path: ["moviesById", movieId, prop],
          value: value || null
        });
      }
    }
  });

  return results;
}

async function getMoviesMetadataByIds(pathSet: any) {
  const userId = this.userId;
  const { movieIds } = pathSet;
  const results: any[] = [];
  const prop = pathSet[2];

  if (!userId) {
    return results;
  }

  let userInfo = null;

  if (userId) {
    userInfo = await findUserById(userId);
  }

  if (!userInfo) {
    return results;
  }

  const userReviews = await findUserReviewsByMovieIds(userId, movieIds);
  const userReviewsByMovieIds = {};
  userReviews.forEach((userReview) => userReviewsByMovieIds[userReview.movieId] = userReview);

  const reviews = await findReviewsByMovieIds(movieIds);
  const reviewsByMovieIds = {};
  reviews.forEach((review) => {
    if (reviewsByMovieIds[review.movieId]) {
      reviewsByMovieIds[review.movieId].push(review);
    } else {
      reviewsByMovieIds[review.movieId] = [review];
    }
  });

  console.log(reviewsByMovieIds);

  for (const movieId of movieIds) {
    const userReview = userReviewsByMovieIds[movieId];
    const userRating = userReview && userReview.rating || null;
    const movieReviews = reviewsByMovieIds[movieId] || [];
    const value = $atom({
      isBookmarked: userInfo["bookmarks"].indexOf(movieId) > -1,
      isFavorite: userInfo["favorites"].indexOf(movieId) > -1,
      ratings: movieReviews.map((review) => review.rating),
      userRating
    });
    console.log(value);
    value.$expires = 0; // expire immediately
    results.push({
      path: ["moviesById", movieId, prop],
      value
    });
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
    route: "moviesById[{integers:movieIds}].metadata",
    get: getMoviesMetadataByIds
  },
  {
    route: "moviesSearches[{keys:query}]",
    get: searchMoviesByQuery
  }
];
