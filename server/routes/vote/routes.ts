import { removeVote, saveVote } from "../../services/vote/service";

async function addVote(callPath: any, args: any) {
  const userId = this.userId;

  if (userId == null) {
    return [{
      path: ["addVote"],
      value: {
        $type: "error",
        value: "Not Authorized"
      }
    }];
  }

  const vote = { userId, ...args[0] };
  const result = await saveVote(vote);
  const results: any[] = [];

  results.push({
    path: ["addVote"],
    invalidated: true
  });

  return results;
}

async function deleteVote(callPath: any, args: any) {
  const userId = this.userId;

  if (userId == null) {
    return [{
      path: ["deleteVote"],
      value: {
        $type: "error",
        value: "Not Authorized"
      }
    }];
  }

  const vote = { userId, ...args[0] };
  const result = await removeVote(vote);
  const results: any[] = [];

  results.push({
    path: ["deleteVote"],
    invalidated: true
  });

  return results;
}

export default [
  {
    route: "addVote",
    call: addVote
  },
  {
    route: "deleteVote",
    call: deleteVote
  }
];
