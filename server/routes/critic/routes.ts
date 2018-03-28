import * as dateFormat from "dateformat";
import * as jsonGraph from "falcor-json-graph";
import { findCriticById } from "../../services/critic/service";

const $ref = jsonGraph.ref;
const $err = jsonGraph.error;

async function getCriticsByIds(params: any) {
  const { criticIds } = params;
  const keys = params[2];
  const results: any[] = [];

  for (const criticId of criticIds) {
    const critic = await findCriticById(criticId);

    for (const key of keys) {
      const value = critic[key];

      results.push({
        path: ["criticsById", criticId, key],
        value: value || null
      });
    }
  }

  return results;
}

async function getReviewsCountByCriticIds(params: any) {
  const { criticIds } = params;
  const results: any[] = [];

  for (const criticId of criticIds) {
    const critic = await findCriticById(criticId);
    const value = critic.reviewIds.length;

    results.push({
      path: ["reviewsByCriticId", criticId, "reviews", "length"],
      value
    });
  }

  return results;
}

async function getReviewsByCriticIds(params: any) {
  const { criticIds, reviewIndices } = params;
  const results: any[] = [];

  for (const criticId of criticIds) {
    const critic = await findCriticById(criticId);
    const reviewIds = critic.reviewIds;

    if (!reviewIds.length) {
      results.push({
        path: ["reviewsByCriticId", criticId],
        value: null
      });
    }
    else {
      for (const reviewIndex of reviewIndices) {
        let value: any = null;
        const reviewId = reviewIds[reviewIndex];

        if (criticId) {
          value = $ref(["reviewsById", reviewId]);
        }

        results.push({
          path: ["reviewsByCriticId", criticId, "reviews", reviewIndex],
          value
        });
      }
    }
  }

  return results;
}

export default [
  {
    route: "criticsById[{integers:criticIds}]['name','image']",
    get: getCriticsByIds
  },
  {
    route: "reviewsByCriticId[{integers:criticIds}].reviews.length",
    get: getReviewsCountByCriticIds
  },
  {
    route: "reviewsByCriticId[{integers:criticIds}].reviews[{integers:reviewIndices}]",
    get: getReviewsByCriticIds
  }
];
