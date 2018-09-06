import * as dateFormat from "dateformat";
import * as jsonGraph from "falcor-json-graph";
import { findCelebById, findCelebsByMovieId, findCelebsCountByMovieId } from "../../services/celeb/service";

const $ref = jsonGraph.ref;
const $err = jsonGraph.error;

async function getCelebsByIds(params: any) {
  const { celebIds } = params;
  const keys = params[2] || ["id", "name", "photo", "dob"];
  const results: any[] = [];

  for (const celebId of celebIds) {
    const celeb = await findCelebById(celebId);

    for (const key of keys) {
      let value = celeb[key];

      if (key === "dob") {
        const dateStr = celeb["dob"];
        const date = new Date(dateStr);
        value = dateFormat(date, "mediumDate");
      }

      results.push({
        path: ["celebsById", celebId, key],
        value: value || null
      });
    }
  }

  return results;
}

async function getCelebsCountByMovieIds(params: any) {
  const { movieIds } = params;
  const results: any[] = [];

  for (const movieId of movieIds) {
    const count = await findCelebsCountByMovieId(movieId);
    let value = count;

    if (value == null) {
      value = null;
    }

    results.push({
      path: ["celebsByMovieId", movieId, "celebs", "length"],
      value
    });
  }

  return results;
}

async function getCelebsByMovieIds(params: any) {
  const { movieIds, celebIndices } = params;
  const results: any[] = [];

  for (const movieId of movieIds) {
    const celebs = await findCelebsByMovieId(movieId);

    if (!celebs.length) {
      results.push({
        path: ["celebsByMovieId", movieId],
        value: null
      });
    }
    else {
      for (const celebIndex of celebIndices) {
        let value: any = null;
        const celeb = celebs[celebIndex];
        const celebId = celeb && celeb.id;

        if (celebId && movieId) {
          value = $ref(["celebsById", celebId]);
        }
        else {
          value = $err("not available");
        }

        results.push({
          path: ["celebsByMovieId", movieId, "celebs", celebIndex],
          value
        });
      }
    }
  }

  return results;
}

export default [
  {
    route: "celebsById[{integers:celebIds}]",
    get: getCelebsByIds
  },
  {
    route: "celebsByMovieId[{integers:movieIds}].celebs.length",
    get: getCelebsCountByMovieIds
  },
  {
    route: "celebsByMovieId[{integers:movieIds}].celebs[{integers:celebIndices}]",
    get: getCelebsByMovieIds
  }
];
