import * as jsonGraph from "falcor-json-graph";
import { findReviewById, findReviewsByMovieId, findReviewsCountByMovieId } from "../../services/review/service";

const $ref = jsonGraph.ref;

async function getReviewsByIds(params: any) {
  const { reviewIds } = params;
  const keys = params[2];
  const results: any[] = [];

  for (const reviewId of reviewIds) {
    const review = await findReviewById(reviewId);

    for (const key of keys) {
      const value = review[key];

      results.push({
        path: ["reviewsById", reviewId, key],
        value: value || null
      });
    }
  }

  return results;
}

async function getReviewsCountByMovieIds(params: any) {
  const { movieIds } = params;
  const results: any[] = [];

  for (const movieId of movieIds) {
    const rows = await findReviewsCountByMovieId(movieId);
    let value = rows && rows[0] && rows[0].count;

    if (value == null) {
      value = null;
    }

    results.push({
      path: ["reviewsByMovieId", movieId, "reviews", "length"],
      value
    });
  }

  return results;
}

async function getReviewsByMovieIds(params: any) {
  const { movieIds, reviewIndices } = params;
  const results: any[] = [];

  for (const movieId of movieIds) {
    const reviews = await findReviewsByMovieId(movieId);

    if (!reviews.length) {
      results.push({
        path: ["reviewsByMovieId", movieId],
        value: null
      });
    }
    else {
      for (const reviewIndex of reviewIndices) {
        let value: any = null;
        const review = reviews[reviewIndex];
        const reviewId = review && review.id;

        if (movieId) {
          value = $ref(["reviewsById", reviewId]);
        }

        results.push({
          path: ["reviewsByMovieId", movieId, "reviews", reviewIndex],
          value
        });
      }
    }
  }

  return results;
}

export default [
  {
    route: "reviewsById[{integers:reviewIds}]['url','rating','critic']",
    get: getReviewsByIds
  },
  {
    route: "reviewsByMovieId[{integers:movieIds}].reviews.length",
    get: getReviewsCountByMovieIds
  },
  {
    route: "reviewsByMovieId[{integers:movieIds}].reviews[{integers:reviewIndices}]",
    get: getReviewsByMovieIds
  }
];
