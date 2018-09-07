import * as dateFormat from "dateformat";
import * as jsonGraph from "falcor-json-graph";
import { findUserByAuthId, findUserById } from "../../services/user/service";

const $ref = jsonGraph.ref;
const $atom = jsonGraph.atom;

async function getUsersById(params: any) {
  console.log("getUsersById", params);
  const { userIds } = params;
  const keys = params[2] || ["id", "authId", "bookmarks", "seen"];
  const results: any[] = [];

  for (const userId of userIds) {
    const user = await findUserById(userId);

    for (const key of keys) {
      let value = user[key];

      if (key === "bookmarks" || key === "seen") {
        value = $atom(value);
      }

      results.push({
        path: ["usersById", userId, key],
        value: value || null
      });
    }
  }

  return results;
}

export default [
  {
    route: "usersById[{integers:userIds}]",
    get: getUsersById
  }
];
