import * as express from "express";
import * as admin from "firebase-admin";
import * as serviceAccount from "../config/serviceAccountKey.json";
import { findOrCreateUser, findUserByAuthId } from "../services/user/service";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  databaseURL: "https://statbox89.firebaseio.com"
});

async function verifyToken(idToken: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (err) {
    // Handle error
  }
}

const router = express.Router();

router.use("/", async (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["authorization"];

  try {
    const uid: any = await verifyToken(token);
    console.log("uid", uid);
    req.body.authId = uid;
    next();
  } catch (err) {
    // handle err
    console.log("err!!", err);
  }
});

router.route("/getUserId")
  .get(async (req, res) => {
    console.log("body", req.body.authId, Date.now());
    const userId = await findOrCreateUser(req.body.authId);

    console.log("userId", userId);
    // res.cookie("userId", userId);
    res.send({ status: "success", userId });
  });

export default router;
