import * as jsonGraph from "falcor-json-graph";
import { findRolesByCelebIds, findRolesByIds } from "../../services/role/service";

const $ref = jsonGraph.ref;

async function getRolesByIds(params: any) {
  const { roleIds } = params;
  const keys = params[2] || ["id", "type", "category", "celeb"];
  const results: any[] = [];

  const roles = await findRolesByIds(roleIds);

  roles.forEach((role) => {
    for (const key of keys) {
      let value: any = role[key];

      if (key === "celeb") {
        value = $ref(["celebsById", role.celebId]);
      }

      results.push({
        path: ["rolesById", role.id, key],
        value: value || null
      });
    }
  });

  return results;
}

async function getMoviesByCelebId(params: any) {
  const { celebIds, movieIndices } = params;
  const results: any[] = [];

  const rolesByCelebIds = await findRolesByCelebIds(celebIds);

  for (const celebId of celebIds) {
    const roles = rolesByCelebIds.filter((role) => role.celebId === celebId);

    if (!roles.length) {
      results.push({
        path: ["moviesByCelebId", celebId],
        value: null
      });
    }
    else if (movieIndices) {
      for (const movieIndex of movieIndices) {
        let value: any = null;
        const role = roles[movieIndex];

        if (celebId && role) {
          value = $ref(["moviesById", role.movieId]);
        }

        results.push({
          path: ["moviesByCelebId", celebId, "movies", movieIndex],
          value
        });
      }
    }

    results.push({
      path: ["moviesByCelebId", celebId, "movies", "length"],
      value: roles.length
    });
  }

  return results;
}

export default [
  {
    route: "rolesById[{integers:roleIds}]",
    get: getRolesByIds
  },
  {
    route: "moviesByCelebId[{integers:celebIds}].movies",
    get: getMoviesByCelebId
  },
  {
    route: "moviesByCelebId[{integers:celebIds}].movies[{integers:movieIndices}]",
    get: getMoviesByCelebId
  }
];
