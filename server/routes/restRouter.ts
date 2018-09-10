import * as express from "express";
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

export default router;
