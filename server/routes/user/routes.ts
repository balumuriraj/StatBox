import * as jsonGraph from "falcor-json-graph";
import { findMoviesByIds } from "../../services/movie/service";
import { findReviewsByUserIds } from "../../services/review/service";
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

async function getUsersReviewsByIds(params: any) {
  const { userIds } = params;
  const results: any[] = [];

  const reviewsByUserIds = await findReviewsByUserIds(userIds);

  for (const userId of userIds) {
    const reviews = reviewsByUserIds.filter((review) => review.userId === userId);

    reviews.forEach((review, index) => {
      const value = $ref(["reviewsById", review.id]);
      value.$expires = -1000; // expires a second later
      results.push({
        path: ["usersById", userId, "reviews", index],
        value
      });
    });

    const value = $atom(reviews.length);
    value.$expires = 0; // expire immediately

    results.push({
      path: ["usersById", userId, "reviews", "length"],
      value
    });
  }

  return results;
}

async function getUsersMetadataByIds(params: any) {
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
  const userId = callPath["userIds"][0];

  if (this.userId == null || this.userId !== Number(userId)) {
    throw new Error("not authorized");
  }

  const movieId = args[0];
  const user = await addUserBookmark(userId, movieId);
  const bookmarksLength = user.bookmarks.length;

  return [
    {
      path: ["usersById", userId, "bookmarks", bookmarksLength - 1],
      value: $ref(["moviesById", movieId])
    },
    {
      path: ["usersById", userId, "bookmarks", "length"],
      value: bookmarksLength
    }
  ];
}

async function removeBookmark(callPath: any, args: any) {
  const userId = callPath["userIds"][0];

  if (this.userId == null || this.userId !== Number(userId)) {
    throw new Error("not authorized");
  }

  const movieId = args[0];
  const user = await removeUserBookmark(userId, movieId);
  const index = user.bookmarks.indexOf(movieId);
  const bookmarksLength = user.bookmarks.length;

  return [
    {
      path: ["usersById", userId, "bookmarks", { from: index, to: bookmarksLength }],
      invalidated: true
    },
    {
      path: ["usersById", userId, "bookmarks", "length"],
      value: bookmarksLength
    }
  ] as any;
}

async function addFavorite(callPath: any, args: any) {
  const userId = callPath["userIds"][0];

  if (this.userId == null || this.userId !== Number(userId)) {
    throw new Error("not authorized");
  }

  const movieId = args[0];
  const user = await addUserFavorite(userId, movieId);
  const favoriteLength = user.favorites.length;

  return [
    {
      path: ["usersById", userId, "favorites", favoriteLength - 1],
      value: $ref(["moviesById", movieId])
    },
    {
      path: ["usersById", userId, "favorites", "length"],
      value: favoriteLength
    }
  ];
}

async function removeFavorite(callPath: any, args: any) {
  const userId = callPath["userIds"][0];

  if (this.userId == null || this.userId !== Number(userId)) {
    throw new Error("not authorized");
  }

  const movieId = args[0];
  const user = await removeUserFavorite(userId, movieId);
  const index = user.favorites.indexOf(movieId);
  const favoriteLength = user.favorites.length;

  return [
    {
      path: ["usersById", userId, "favorites", { from: index, to: favoriteLength }],
      invalidated: true
    },
    {
      path: ["usersById", userId, "favorites", "length"],
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
    route: "usersById[{integers:userIds}].reviews",
    get: getUsersReviewsByIds
  },
  {
    route: "usersById[{integers:userIds}].metadata['genres','ratingBins','movieMinutes','moviesCount','topDirectors','topActors']",
    get: getUsersMetadataByIds
  },
  {
    route: "usersById[{integers:userIds}].addBookmark",
    call: addBookmark
  },
  {
    route: "usersById[{integers:userIds}].removeBookmark",
    call: removeBookmark
  },
  {
    route: "usersById[{integers:userIds}].addFavorite",
    call: addFavorite
  },
  {
    route: "usersById[{integers:userIds}].removeFavorite",
    call: removeFavorite
  }
];
