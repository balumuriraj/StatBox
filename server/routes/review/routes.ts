import * as jsonGraph from "falcor-json-graph";
import { addOrUpdateReview, findReviewsByIds, findReviewsByUserId, findReviewsCountByUserId } from "../../services/review/service";

const $ref = jsonGraph.ref;
const $atom = jsonGraph.atom;

async function getReviewsById(params: any) {
  const { reviewIds } = params;
  const keys = params[2] || ["id", "movie", "rating", "watchWith", "pace", "theme", "plot"];
  const results: any[] = [];

  const reviews = await findReviewsByIds(reviewIds);

  reviews.forEach((review) => {
    for (const key of keys) {
      if (key === "movie") {
        results.push({
          path: ["reviewsById", review.id, key],
          value: $ref(["moviesById", review.movieId])
        });
      } else {
        results.push({
          path: ["reviewsById", review.id, key],
          value: review[key] || null
        });
      }
    }
  });

  return results;
}

async function updateReview(callPath: any, args: any) {
  const userId = callPath["userIds"][0];

  console.log(userId, this.userId);
  if (this.userId == null || this.userId !== Number(userId)) {
    throw new Error("not authorized");
  }

  const review = args[0];
  const reviewsLengthBefore = await findReviewsCountByUserId(userId);
  const result = await addOrUpdateReview(review);
  const reviews = await findReviewsByUserId(userId);
  const reviewsLength = reviews.length;
  const isAdd = reviewsLength - reviewsLengthBefore === 1;
  const results: any[] = [];

  if (isAdd) {
    results.push({
      path: ["usersById", userId, "reviews", reviewsLength - 1],
      value: $ref(["reviewsById", result.id])
    }, {
      path: ["usersById", userId, "reviews", "lastUpdatedIndex"],
      value: reviewsLength - 1
    });
  } else {
    const index = reviews.map((review) => review.id).indexOf(result.id);

    results.push({
      path: ["usersById", userId, "reviews", index],
      value: $ref(["reviewsById", result.id])
    }, {
      path: ["usersById", userId, "reviews", "lastUpdatedIndex"],
      value: index
    });
  }

  results.push({
    path: ["usersById", userId, "reviews", {to: reviewsLength}],
    invalidated: true
  }, {
    path: ["usersById", userId, "reviews", "length"],
    value: reviewsLength
  });

  return results;
}

export default [
  {
    route: "reviewsById[{integers:reviewIds}]",
    get: getReviewsById
  },
  {
    route: "usersById[{integers:userIds}].updateReview",
    call: updateReview
  }
];
