import * as express from "express";
import { findMoviesByTerm } from "../services/movie/service";
import { findOrCreateUser } from "../services/user/service";

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

export default router;
