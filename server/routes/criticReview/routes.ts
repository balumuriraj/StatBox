import * as jsonGraph from "falcor-json-graph";
import { findCriticReviewById, findCriticReviewsByMovieId, findCriticReviewsCountByMovieId } from "../../services/criticReview/service";

const $ref = jsonGraph.ref;

async function getCriticReviewsByIds(params: any) {
  const { criticReviewIds } = params;
  const keys = params[2];
  const results: any[] = [];

  for (const criticReviewId of criticReviewIds) {
    const criticReview = await findCriticReviewById(criticReviewId);

    for (const key of keys) {
      const value = criticReview[key];

      results.push({
        path: ["criticReviewsById", criticReviewId, key],
        value: value || null
      });
    }
  }

  return results;
}

async function getCriticReviewsCountByMovieIds(params: any) {
  const { movieIds } = params;
  const results: any[] = [];

  for (const movieId of movieIds) {
    const rows = await findCriticReviewsCountByMovieId(movieId);
    let value = rows && rows[0] && rows[0].count;

    if (value == null) {
      value = null;
    }

    results.push({
      path: ["criticReviewsByMovieId", movieId, "criticReviews", "length"],
      value
    });
  }

  return results;
}

async function getCriticReviewsByMovieIds(params: any) {
  const { movieIds, criticReviewIndices } = params;
  const results: any[] = [];

  for (const movieId of movieIds) {
    const criticReviews = await findCriticReviewsByMovieId(movieId);

    if (!criticReviews.length) {
      results.push({
        path: ["criticReviewsByMovieId", movieId],
        value: null
      });
    }
    else {
      for (const criticReviewIndex of criticReviewIndices) {
        let value: any = null;
        const criticReview = criticReviews[criticReviewIndex];
        const criticReviewId = criticReview && criticReview.id;

        if (movieId) {
          value = $ref(["criticReviewsById", criticReviewId]);
        }

        results.push({
          path: ["criticReviewsByMovieId", movieId, "criticReviews", criticReviewIndex],
          value
        });
      }
    }
  }

  return results;
}

export default [
  {
    route: "criticReviewsById[{integers:criticReviewIds}]['url','rating','critic']",
    get: getCriticReviewsByIds
  },
  {
    route: "criticReviewsByMovieId[{integers:movieIds}].criticReviews.length",
    get: getCriticReviewsCountByMovieIds
  },
  {
    route: "criticReviewsByMovieId[{integers:movieIds}].criticReviews[{integers:criticReviewIndices}]",
    get: getCriticReviewsByMovieIds
  }
];
