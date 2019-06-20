import { VoteModel } from "./model";

export async function saveVote(vote: any) {
  return await VoteModel.create({ ...vote, timestamp: Date.now() });
}

export async function removeVote(vote: any) {
  return await VoteModel.deleteOne(vote);
}

export async function removeUserVotes(userId: number) {
  return await VoteModel.deleteMany({ userId });
}

export async function findVotesByPollIds(pollIds: number[], limit: number, skip: number) {
  const match: any = {
    pollId: { $in: pollIds }
  };

  const group: any = {
    _id: { pollId: "$pollId", movieId: "$movieId" },
    count: { $sum: 1 }
  };

  const group2: any = {
    _id: "$_id.pollId",
    votes: { $push: { movieId: "$_id.movieId", count: "$count" } },
    count: {$sum: "$count"}
  };

  const group3: any = {
    _id: { pollId: "$_id", count: "$count" },
    votes: { $push: { movieId: "$votes.movieId", count: "$votes.count" } }
  };

  const query: any[] = [
    {$match: match},
    {$group: group},
    {$group: group2},
    {$unwind: "$votes"},
    {$sort: { "votes.count": -1, "_id": 1 } },
    {$skip: skip},
    {$limit: limit},
    {$group: group3}
  ];

  const result = await VoteModel.aggregate(query);

  return result.map(({ _id, votes, count }) => {
    console.log("pollId: ", _id.pollId, "count: ", _id.count);
    votes.forEach((vote) => console.log("vote: ", JSON.stringify(vote)));
    return {
      pollId: _id.pollId,
      votes,
      count: _id.count
    };
  });
}

export async function findUserVoteByPollIds(pollIds: number[], userId: number) {
  const match: any = {
    pollId: { $in: pollIds }
  };

  const group: any = {
    _id: { pollId: "$pollId", movieId: "$movieId" },
    votes: { $push: { userId: "$userId" } },
    count: { $sum: 1 }
  };

  const match2: any = {
    "votes.userId": userId
  };

  const query: any[] = [
    {$match: match},
    {$group: group},
    {$unwind: "$votes"},
    {$match: match2}
  ];

  const results = await VoteModel.aggregate(query);
  const result = {};

  results.forEach(({ _id, count }) => {
    result[_id.pollId] = {
      movieId: _id.movieId,
      count
    };
  });

  // console.log(result);

  return result;
}
