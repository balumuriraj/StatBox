import * as dateFormat from "dateformat";
import * as jsonGraph from "falcor-json-graph";
import { findUserByAuthId, findUserById } from "../../services/user/service";

const $ref = jsonGraph.ref;
const $atom = jsonGraph.atom;

async function getUsersByIds(params: any) {
  const { userIds } = params;
  const keys = params[2];
  const results: any[] = [];

  for (const userId of userIds) {
    const user = await findUserById(userId);

    for (const key of keys) {
      const value = user[key];

      results.push({
        path: ["usersById", userId, key],
        value: value || null
      });
    }
  }

  return results;
}

async function getUsersByAuthIds(params: any) {
  const { authIds } = params;
  const keys = params[2];
  const results: any[] = [];

  for (const authId of authIds) {
    const user = await findUserByAuthId(authId);

    for (const key of keys) {
      let value = user[key];

      if (key === "bookmarks" || key === "notInterested") {
        const movies = value.map((movieId) => $ref(["moviesById", movieId]));
        value = $atom(movies);
      }

      results.push({
        path: ["usersById", authId, key],
        value: value || null
      });
    }
  }

  return results;
}

export default [
  {
    route: "usersById[{integers:userIds}]['bookmarks','notInterested']",
    get: getUsersByIds
  },
  {
    route: "usersByAuthId[{authIds}]['id','bookmarks','notInterested']",
    get: getUsersByAuthIds
  }
];
