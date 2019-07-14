import { IPoll, PollModel } from "./model";

async function generatePollsData(polls: IPoll[]) {
  const result: any[] = [];

  if (polls) {
    for (const poll of polls) {
      const res = await generatePollData(poll);
      result.push(res);
    }
  }

  return result;
}

async function generatePollData(poll: any) {
  if (poll) {
    return {
      id: poll.pollId,
      title: poll.title,
      image: poll.image,
      type: poll.type,
      filter: poll.filter,
      timestamp: poll.timestamp
    };
  }
}

export async function createPoll(poll: any) {
  const result = await PollModel.create({...poll, timestamp: Date.now()});
  return generatePollData(result);
}

export async function updatePoll(pollId: number, poll: any) {
  const result = await PollModel.update(pollId, poll);
  return generatePollData(result);
}

export async function deletePoll(pollId: number) {
  return await PollModel.deleteOne(pollId);
}

export async function findPollsCount() {
  return PollModel.count();
}

export async function findPollById(pollId: number) {
  const poll = await PollModel.findById(pollId);
  return await generatePollData(poll);
}

export async function findPollIds(limit?: number, skip?: number) {
  const query: any[] = [{
    $project: {
      pollId: 1
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
  return pollIds.map(({ pollId }) => pollId);
}

export async function findPollsByIds(ids: number[]) {
  const query = [{ pollId: { $in: ids } }];
  const polls = await PollModel.find(query);
  return await generatePollsData(polls);
}

export async function findPolls(limit?: number, skip?: number): Promise<any> {
  const query: any = [];

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

  const polls = await PollModel.aggregate(query);
  return generatePollsData(polls);
}
