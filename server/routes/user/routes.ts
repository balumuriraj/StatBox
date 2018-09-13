import * as jsonGraph from "falcor-json-graph";
import { findReviewsByUserId } from "../../services/review/service";
import {
  addUserBookmarks,
  addUserSeen,
  findUserById,
  removeUserBookmarks,
  removeUserSeen
} from "../../services/user/service";

const $ref = jsonGraph.ref;
const $atom = jsonGraph.atom;

async function getUsersById(params: any) {
  const { userIds } = params;
  const keys = params[2] || ["id", "authId", "bookmarks", "seen"];
  const results: any[] = [];

  for (const userId of userIds) {
    const user = await findUserById(userId);

    for (const key of keys) {
      if (key === "bookmarks" || key === "seen" || key === "reviewed") {
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
  }

  return results;
}

async function getUserReviewsById(params: any) {
  const { userIds } = params;
  console.log("params", params);
  const results: any[] = [];

  for (const userId of userIds) {
    const reviews = await findReviewsByUserId(userId);

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

async function addBookmark(callPath: any, args: any) {
  const userId = callPath["userIds"][0];

  if (this.userId == null || this.userId !== Number(userId)) {
    throw new Error("not authorized");
  }

  const movieId = args[0];
  const user = await addUserBookmarks(userId, movieId);
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
  const user = await removeUserBookmarks(userId, movieId);
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

async function addSeen(callPath: any, args: any) {
  const userId = callPath["userIds"][0];

  if (this.userId == null || this.userId !== Number(userId)) {
    throw new Error("not authorized");
  }

  const movieId = args[0];
  const user = await addUserSeen(userId, movieId);
  const seenLength = user.seen.length;

  return [
    {
      path: ["usersById", userId, "seen", seenLength - 1],
      value: $ref(["moviesById", movieId])
    },
    {
      path: ["usersById", userId, "seen", "length"],
      value: seenLength
    }
  ];
}

async function removeSeen(callPath: any, args: any) {
  const userId = callPath["userIds"][0];

  if (this.userId == null || this.userId !== Number(userId)) {
    throw new Error("not authorized");
  }

  const movieId = args[0];
  const user = await removeUserSeen(userId, movieId);
  const index = user.seen.indexOf(movieId);
  const seenLength = user.seen.length;

  return [
    {
      path: ["usersById", userId, "seen", { from: index, to: seenLength }],
      invalidated: true
    },
    {
      path: ["usersById", userId, "seen", "length"],
      value: seenLength
    }
  ];
}

export default [
  {
    route: "usersById[{integers:userIds}]",
    get: getUsersById
  },
  {
    route: "usersById[{integers:userIds}].reviews",
    get: getUserReviewsById
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
    route: "usersById[{integers:userIds}].addSeen",
    call: addSeen
  },
  {
    route: "usersById[{integers:userIds}].removeSeen",
    call: removeSeen
  }
];
