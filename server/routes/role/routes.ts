import * as jsonGraph from "falcor-json-graph";
import { findRoleById, findRolesByCelebId, findRolesByMovieId, findRolesCountByCelebId, findRolesCountByMovieId } from "../../services/role/service";

const $ref = jsonGraph.ref;

async function getRolesByIds(params: any) {
  const { roleIds } = params;
  const keys = params[2] || ["id", "type", "category", "celeb"];
  const results: any[] = [];

  for (const roleId of roleIds) {
    const role = await findRoleById(roleId);

    for (const key of keys) {
      let value: any = role[key];

      if (key === "celeb") {
        value = $ref(["celebsById", role.celebId]);
      }

      results.push({
        path: ["rolesById", roleId, key],
        value: value || null
      });
    }
  }

  return results;
}

async function getCastCountByMovieIds(params: any) {
  const { movieIds } = params;
  const results: any[] = [];

  for (const movieId of movieIds) {
    const rows = await findRolesCountByMovieId(movieId, "cast");
    let value = rows && rows[0] && rows[0].count;

    if (value == null) {
      value = null;
    }

    results.push({
      path: ["castByMovieId", movieId, "roles", "length"],
      value
    });
  }

  return results;
}

async function getCastByMovieIds(params: any) {
  const { movieIds, roleIndices } = params;
  const results: any[] = [];

  for (const movieId of movieIds) {
    const roles = await findRolesByMovieId(movieId, "cast");

    if (!roles.length) {
      results.push({
        path: ["castByMovieId", movieId],
        value: null
      });
    }
    else {
      for (const roleIndex of roleIndices) {
        let value: any = null;
        const role = roles[roleIndex];

        if (movieId && role) {
          value = $ref(["rolesById", role.id]);
        }

        results.push({
          path: ["castByMovieId", movieId, "roles", roleIndex],
          value
        });
      }
    }
  }

  return results;
}

async function getCrewCountByMovieIds(params: any) {
  const { movieIds } = params;
  const results: any[] = [];

  for (const movieId of movieIds) {
    const rows = await findRolesCountByMovieId(movieId, "crew");
    let value = rows && rows[0] && rows[0].count;

    if (value == null) {
      value = null;
    }

    results.push({
      path: ["crewByMovieId", movieId, "roles", "length"],
      value
    });
  }

  return results;
}

async function getCrewByMovieIds(params: any) {
  const { movieIds, roleIndices } = params;
  const results: any[] = [];

  for (const movieId of movieIds) {
    const roles = await findRolesByMovieId(movieId, "crew");

    if (!roles.length) {
      results.push({
        path: ["crewByMovieId", movieId],
        value: null
      });
    }
    else {
      for (const roleIndex of roleIndices) {
        let value: any = null;
        const role = roles[roleIndex];

        if (movieId && role) {
          value = $ref(["rolesById", role.id]);
        }

        results.push({
          path: ["crewByMovieId", movieId, "roles", roleIndex],
          value
        });
      }
    }
  }

  return results;
}

async function getMoviesCountByCelebId(params: any) {
  const { celebIds } = params;
  const results: any[] = [];

  for (const celebId of celebIds) {
    const rows = await findRolesCountByCelebId(celebId);
    let value = rows && rows[0] && rows[0].count;

    if (value == null) {
      value = null;
    }

    results.push({
      path: ["moviesByCelebId", celebId, "movies", "length"],
      value
    });
  }

  return results;
}

async function getMoviesByCelebId(params: any) {
  const { celebIds, movieIndices } = params;
  const results: any[] = [];

  for (const celebId of celebIds) {
    const roles = await findRolesByCelebId(celebId);

    if (!roles.length) {
      results.push({
        path: ["moviesByCelebId", celebId],
        value: null
      });
    }
    else {
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
  }

  return results;
}

export default [
  {
    route: "rolesById[{integers:roleIds}]",
    get: getRolesByIds
  },
  {
    route: "castByMovieId[{integers:movieIds}].roles.length",
    get: getCastCountByMovieIds
  },
  {
    route: "castByMovieId[{integers:movieIds}].roles[{integers:roleIndices}]",
    get: getCastByMovieIds
  },
  {
    route: "crewByMovieId[{integers:movieIds}].roles.length",
    get: getCrewCountByMovieIds
  },
  {
    route: "crewByMovieId[{integers:movieIds}].roles[{integers:roleIndices}]",
    get: getCrewByMovieIds
  },
  {
    route: "moviesByCelebId[{integers:celebIds}].movies.length",
    get: getMoviesCountByCelebId
  },
  {
    route: "moviesByCelebId[{integers:celebIds}].movies[{integers:movieIndices}]",
    get: getMoviesByCelebId
  }
];
