import * as jsonGraph from "falcor-json-graph";
import { findMoviesByIds } from "../../services/movie/service";
import { findReviewCountsByUserIds, findReviewIdsByUserIds, findReviewsByUserIds } from "../../services/review/service";
import { findRolesByMovieIds } from "../../services/role/service";
import {
  addUserBookmark,
  addUserFavorite,
  findUsersByIds,
  removeUserBookmark,
  removeUserFavorite
} from "../../services/user/service";

const $ref = jsonGraph.ref;
const $atom = jsonGraph.atom;

const sortFunc = (a, b) => b.rating - a.rating;

async function getUsersByIds(params: any) {
  const { userIds } = params;
  const keys = params[2] || ["id", "authId", "bookmarks", "favorites"];
  const results: any[] = [];

  const users = await findUsersByIds(userIds);

  users.forEach((user) => {
    const userId = user.id;

    for (const key of keys) {
      if (key === "bookmarks" || key === "favorites" || key === "reviewed") {
        const movieIds = user[key];

        if (movieIds.length) {
          movieIds.forEach((movieId, index) => {
            const value = $ref(["moviesById", movieId]);
            value.$expires = -1000; // expires a second later
            results.push({
              path: ["usersById", userId, key, index],
              value
            });
          });

          const value = $atom(movieIds.length);
          value.$expires = 0; // expire immediately

          results.push({
            path: ["usersById", userId, key, "length"],
            value
          });
        } else {
          results.push({
            path: ["usersById", userId, key],
            value: null
          });
        }
      } else {
        results.push({
          path: ["usersById", userId, key],
          value: user[key] || null
        });
      }
    }
  });

  return results;
}

async function getUsersReviewsLength(params: any) {
  const { userIds } = params;
  const results: any[] = [];
  const reviewcountsByUserIds = await findReviewCountsByUserIds(userIds);

  for (const userId of userIds) {
    const value = $atom(reviewcountsByUserIds[userId]);
    value.$expires = 0; // expire immediately

    results.push({
      path: ["usersById", userId, "reviews", "length"],
      value
    });
  }

  return results;
}

async function getUsersReviews(params: any) {
  const { userIds, reviewIndices } = params;
  const key = "reviews";
  const limit = reviewIndices.length;
  const skip = reviewIndices[0];
  const results: any[] = [];

  const reviewIdsByUserIds = await findReviewIdsByUserIds(userIds, skip, limit);

  for (const userId of userIds) {
    const reviewIds = reviewIdsByUserIds[userId];

    for (const index in reviewIndices) {
      const reviewId = reviewIds[index];
      const reviewIndex = reviewIndices[index];

      const value = reviewId ? $ref(["reviewsById", reviewId]) : null;
      value.$expires = -1000; // expires a second later
      results.push({
        path: ["usersById", userId, key, reviewIndex],
        value
      });
    }
  }

  return results;
}

// TODO: Optimization
async function getUsersMetadata(params: any) {
  const { userIds } = params;
  const keys = params[3] || ["ratingBins", "movieMinutes", "moviesCount", "topActors", "topDirectors", "genres"];
  const results: any[] = [];

  const reviewsByUserIds = await findReviewsByUserIds(userIds);

  for (const userId of userIds) {
    const reviews = reviewsByUserIds.filter((review) => review.userId === userId);
    const ratingsByMovieId = {};
    const movieIds = [];
    const ratingBins = {};

    reviews.forEach((review) => {
      ratingsByMovieId[review.movieId] = review.rating;
      if (review.rating) {
        if (ratingBins[review.rating]) {
          ratingBins[review.rating]++;
        } else {
          ratingBins[review.rating] = 1;
        }
      }
      movieIds.push(review.movieId);
    });

    const movies = await findMoviesByIds(movieIds);
    const moviesCount = movieIds.length;
    const defaultRuntime = 135;
    const genreCounts = {};
    let movieMinutes = 0;

    movies.forEach((movie) => {
      movieMinutes += movie.runtime || defaultRuntime;

      if (movie.genre) {
        movie.genre.forEach((genreName) => {
          if (genreCounts[genreName]) {
            genreCounts[genreName]++;
          } else {
            genreCounts[genreName] = 1;
          }
        });
      }
    });

    const ratingsByCastId = {};
    const ratingsByCrewId = {};

    const cast = await findRolesByMovieIds(movieIds, "cast", 0);
    const crew = await findRolesByMovieIds(movieIds, "crew", 0);

    cast.forEach((role) => {
      const movieRating = ratingsByMovieId[role.movieId];

      if (ratingsByCastId[role.celebId]) {
        ratingsByCastId[role.celebId].push(movieRating);
      } else {
        ratingsByCastId[role.celebId] = [movieRating];
      }
    });

    crew.forEach((role) => {
      const movieRating = ratingsByMovieId[role.movieId];

      if (ratingsByCrewId[role.celebId]) {
        ratingsByCrewId[role.celebId].push(movieRating);
      } else {
        ratingsByCrewId[role.celebId] = [movieRating];
      }
    });

    const directors = [];
    const actors = [];

    for ( const celebId in ratingsByCastId) {
      const ratingsOfCeleb = ratingsByCastId[celebId];

      actors.push({
        id: celebId,
        rating: ratingsOfCeleb.reduce((a, b) => a + b) / ratingsOfCeleb.length
      });
    }

    for ( const celebId in ratingsByCrewId) {
      const ratingsOfCeleb = ratingsByCrewId[celebId];

      directors.push({
        id: celebId,
        rating: ratingsOfCeleb.reduce((a, b) => a + b) / ratingsOfCeleb.length
      });
    }

    for (const key of keys) {
      let value = null;

      if (key === "topDirectors") {
        directors.sort(sortFunc).slice(0, 5).forEach((obj, idx) => {
          results.push({
            path: ["usersById", userId, "metadata", key, idx, "celeb"],
            value: $ref(["celebsById", obj.id])
          });
          results.push({
            path: ["usersById", userId, "metadata", key, idx, "rating"],
            value: obj.rating
          });
        });
      } else if (key === "topActors") {
        actors.sort(sortFunc).slice(0, 5).forEach((obj, idx) => {
          results.push({
            path: ["usersById", userId, "metadata", key, idx, "celeb"],
            value: $ref(["celebsById", obj.id])
          });
          results.push({
            path: ["usersById", userId, "metadata", key, idx, "rating"],
            value: obj.rating
          });
        });
      } else {
        if (key === "movieMinutes") {
          value = $atom(movieMinutes);
          value.$expires = 0; // expire immediately
        } else if (key === "moviesCount") {
          value = $atom(moviesCount);
          value.$expires = 0; // expire immediately
        } else if (key === "ratingBins") {
          value = $atom(ratingBins);
          value.$expires = 0; // expire immediately
        } else if (key === "genres") {
          const result = [];

          for (const genreName in genreCounts) {
            result.push({
              name: genreName,
              count: genreCounts[genreName]
            });
          }

          value = $atom(result);
          value.$expires = 0; // expire immediately
        }

        results.push({
          path: ["usersById", userId, "metadata", key],
          value
        });
      }
    }
  }

  return results;
}

async function addBookmark(callPath: any, args: any) {
  if (this.userId == null) {
    throw new Error("not authorized");
  }

  const movieId = args[0];

  if (movieId == null) {
    throw new Error("invalid movieId");
  }

  const user = await addUserBookmark(this.userId, movieId);
  const bookmarksLength = user.bookmarks.length;

  return [
    {
      path: ["userBookmarks", bookmarksLength - 1],
      value: $ref(["moviesById", movieId])
    },
    {
      path: ["userBookmarks", "length"],
      value: bookmarksLength
    }
  ];
}

async function removeBookmark(callPath: any, args: any) {
  if (this.userId == null) {
    throw new Error("not authorized");
  }

  const movieId = args[0];

  if (movieId == null) {
    throw new Error("invalid movieId");
  }

  const user = await removeUserBookmark(this.userId, movieId);
  const index = user.bookmarks.indexOf(movieId);
  const bookmarksLength = user.bookmarks.length;

  return [
    {
      path: ["userBookmarks", { from: index, to: bookmarksLength }],
      invalidated: true
    },
    {
      path: ["userBookmarks", "length"],
      value: bookmarksLength
    }
  ] as any;
}

async function addFavorite(callPath: any, args: any) {
  if (this.userId == null) {
    throw new Error("not authorized");
  }

  const movieId = args[0];

  if (movieId == null) {
    throw new Error("invalid movieId");
  }
  // console.log("addFavorite", this.userId, movieId);
  const user = await addUserFavorite(this.userId, movieId);
  const favoriteLength = user.favorites.length;

  return [
    {
      path: ["userFavorites", favoriteLength - 1],
      value: $ref(["moviesById", movieId])
    },
    {
      path: ["userFavorites", "length"],
      value: favoriteLength
    }
  ];
}

async function removeFavorite(callPath: any, args: any) {
  if (this.userId == null) {
    throw new Error("not authorized");
  }

  const movieId = args[0];

  if (movieId == null) {
    throw new Error("invalid movieId");
  }

  // console.log("removeFavorite", this.userId, movieId);
  const user = await removeUserFavorite(this.userId, movieId);
  const index = user.favorites.indexOf(movieId);
  const favoriteLength = user.favorites.length;

  return [
    {
      path: ["userFavorites", { from: index, to: favoriteLength }],
      invalidated: true
    },
    {
      path: ["userFavorites", "length"],
      value: favoriteLength
    }
  ];
}

export default [
  {
    route: "usersById[{integers:userIds}]",
    get: getUsersByIds
  },
  {
    route: "usersById[{integers:userIds}].reviews.length",
    get: getUsersReviewsLength
  },
  {
    route: "usersById[{integers:userIds}].reviews[{integers:reviewIndices}]",
    get: getUsersReviews
  },
  {
    route: "usersById[{integers:userIds}].metadata['genres','ratingBins','movieMinutes','moviesCount','topDirectors','topActors']",
    get: getUsersMetadata
  },
  {
    route: "addBookmark",
    call: addBookmark
  },
  {
    route: "removeBookmark",
    call: removeBookmark
  },
  {
    route: "addFavorite",
    call: addFavorite
  },
  {
    route: "removeFavorite",
    call: removeFavorite
  }
];
