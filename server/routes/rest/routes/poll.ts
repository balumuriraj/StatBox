import { createPoll, deletePoll, findPollById, findPolls, findPollsCount, updatePoll } from "../../../services/poll/service";

const routes = [
  {
    route: "/polls/count",
    method: "GET",
    callback: async (req, res) => {
      const count = await findPollsCount();
      res.send({ count });
    }
  },

  {
    route: "/polls",
    method: "GET",
    callback: async (req, res) => {
      const skip = Number(req.query.skip);
      const limit = Number(req.query.limit);
      const polls = await findPolls(limit, skip);
      res.send(polls);
    }
  },

  {
    route: "/poll/:id",
    method: "GET",
    callback: async (req, res) => {
      const id = req.params.id;
      const poll = await findPollById(id);
      res.send(poll);
    }
  },

  {
    route: "/admin/poll",
    method: "POST",
    callback: async (req, res) => {
      const poll = req.body;
      const result = await createPoll(poll);
      res.send(result);
    }
  },

  {
    route: "/admin/poll/:id",
    method: "PUT",
    callback: async (req, res) => {
      const id = req.params.id;
      const poll = req.body;
      const result = await updatePoll(id, poll);
      res.send(result);
    }
  },

  {
    route: "/admin/poll/:id",
    method: "DELETE",
    callback: async (req, res) => {
      const id = req.params.id;
      const result = await deletePoll(id);
      res.send(result);
    }
  }
];

export default routes;
