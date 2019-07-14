import * as jsonGraph from "falcor-json-graph";
import { findMoviesByFilter } from "../../../services/movie/service";
import { findPollIds, findPollsByIds, findPollsCount } from "../../../services/poll/service";
import { findUserVoteByPollIds, findVotesByPollIds } from "../../../services/vote/service";

const $atom = jsonGraph.atom;
const $ref = jsonGraph.ref;

async function getPollsCount() {
  const key = "length";
  const results: any[] = [];

  const count = await findPollsCount();

  results.push({
    path: ["polls", key],
    value: count || null
  });

  return results;
}

async function getPolls(params: any) {
  const { indices } = params;
  const results: any[] = [];
  const limit = indices.length;
  const skip = indices[0];
  const pollIds = await findPollIds(limit, skip);

  for (let i = 0; i < pollIds.length; i++) {
    const index = indices[i];
    const pollId = pollIds[i];

    let value: any = null;

    if (pollId) {
      value = $ref(["pollsById", pollId]);
    }

    results.push({
      path: ["polls", index],
      value
    });
  }

  return results;
}

async function getPollsByIds(params: any) {
  const { pollIds, indices } = params;
  const keys = params[2];
  const results: any[] = [];

  const limit = indices.length;
  const skip = indices[0];
  const polls = await findPollsByIds(pollIds);

  for (const poll of polls) {
    for (const key of keys) {
      if (key === "suggestions") {
        if (poll.type === "year") {
          const movieIds = await findMoviesByFilter(null, [String(poll.filter)], "rating", limit, skip);
          movieIds.forEach((movieId, index) => {
            results.push({
              path: ["pollsById", poll.id, key, index],
              value: $ref(["moviesById", movieId])
            });
          });
        }
      } else {
        const value = poll[key];

        results.push({
          path: ["pollsById", poll.id, key],
          value: value != null ? value : null
        });
      }
    }
  }

  return results;
}

async function getVotesByPollIds(params: any) {
  const { pollIds } = params;
  const keys = params[2];

  const limit = 3;
  const skip = 0;
  const votesByPollIds = await findVotesByPollIds(pollIds, limit, skip);

  if (!votesByPollIds.length) {
    const results: any[] = [];

    for (const pollId of pollIds) {
      const value = $atom(null);
      value.$expires = 0;

      results.push(
        {
          path: ["pollsById", pollId, "votes"],
          value
        }, {
          path: ["pollsById", pollId, "userVote"],
          value
        }, {
          path: ["pollsById", pollId, "count"],
          value
        }
      );

      return results;
    }
  }

  const userVoteByPollIds = this.userId ? await findUserVoteByPollIds(pollIds, this.userId) : null;

  const results: any[] = [];

  for (const votesByPollId of votesByPollIds) {
    const { pollId, votes, count } = votesByPollId;

    for (const key of keys) {
      if (key === "votes") {
        const value = $atom(votes);
        value.$expires = 0;

        results.push({
          path: ["pollsById", pollId, "votes"],
          value
        });
      } else if (key === "userVote") {
        const value = $atom(userVoteByPollIds ? userVoteByPollIds[pollId] : null);
        value.$expires = 0;

        results.push({
          path: ["pollsById", pollId, "userVote"],
          value
        });
      } else if (key === "count") {
        const value = $atom(count || 0);
        value.$expires = 0;

        results.push({
          path: ["pollsById", pollId, "count"],
          value
        });
      }
    }
  }

  return results;
}

export default [
  {
    route: "polls.length",
    get: getPollsCount
  },
  {
    route: "polls[{integers:indices}]",
    get: getPolls
  },
  {
    route: "pollsById[{integers:pollIds}]['id', 'title', 'image', 'type', 'filter', 'suggestions', 'timestamp'][{integers:indices}]",
    get: getPollsByIds
  },
  {
    route: "pollsById[{integers:pollIds}]['userVote', 'votes', 'count']",
    get: getVotesByPollIds
  }
];
