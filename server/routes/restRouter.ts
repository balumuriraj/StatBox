import * as express from "express";
import { findMoviesByTerm } from "../services/movie/service";
import { createPoll } from "../services/poll/service";
import { removeUserReviews } from "../services/review/service";
import { findOrCreateUser, removeUser } from "../services/user/service";
import { removeUserVotes } from "../services/vote/service";

const router = express.Router();

router.route("/getUserId")
  .get(async (req, res) => {
    let userId = null;

    if (req.body.userId) {
      userId = req.body.userId;
    } else {
      userId = await findOrCreateUser(req.body.authId);
    }
    res.send({ status: "success", userId });
  });

router.route("/deleteAccount")
  .get(async (req, res) => {
    const userId = req.body.userId;

    if (userId) {
      await removeUserVotes(userId);
      await removeUserReviews(userId);
      await removeUser(userId);
      res.send({ status: "success", userId });
    } else {
      res.send({ status: "failure", message: "User not found!" });
    }
  });

router.route("/search")
  .get(async (req, res) => {
    if (req.query) {
      const { content, term } = req.query;
      const result = content === "movies" ? await findMoviesByTerm(term) : null;
      res.send(result);
    } else {
      res.send(null);
    }
  });

// TODO: add creds
// router.route("/admin/createPoll")
//   .post(async (req, res) => {
//     if (req.body) {
//       const { title, type, filter } = req.body;
//       const result: any = await createPoll({title, type, filter});
//       res.send(String(result));
//     } else {
//       res.send(null);
//     }
//   });

export default router;
