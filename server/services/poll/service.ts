import { IPoll, PollModel } from "./model";

async function generatePollsData(polls: IPoll[]) {
  const result: any[] = [];

  for (const poll of polls) {
    const res = await generatePollData(poll);
    result.push(res);
  }

  return result;
}

async function generatePollData(poll: any) {
  return {
    id: poll._id,
    title: poll.title,
    image: poll.image,
    type: poll.type,
    filter: poll.filter,
    votes: poll.votes,
    timestamp: poll.timestamp
  };
}

export async function findPollsCount() {
  const query = [
    { $count: "count" }
  ];

  const results = await PollModel.aggregate(query);
  return results && results[0] && results[0].count || 0;
}

export async function findPollIds(limit?: number, skip?: number) {
  const query: any[] = [{
    $project: {
      _id: 1
    }
  }];

  if (skip) {
    query.push({
      $skip: skip
    });
  }

  if (limit) {
    query.push({
      $limit: limit
    });
  }

  const pollIds = await PollModel.aggregate(query);
  return pollIds.map(({ _id }) => _id);
}

export async function findPollsByIds(ids: number[]) {
  const query = [{ _id: { $in: ids } }];
  const polls = await PollModel.find(query);
  return await generatePollsData(polls);
}

export async function createPoll(obj: any) {
  return await PollModel.create({ ...obj, timestamp: Date.now() });
}
