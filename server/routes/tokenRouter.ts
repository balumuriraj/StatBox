import * as express from "express";
import * as admin from "firebase-admin";
import * as serviceAccount from "../config/serviceAccountKey.json";
import { findUserByAuthId } from "../services/user/service";

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
    throw err;
  }
}

const router = express.Router();

router.use("/", async (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    next();
    return;
  }

  try {
    const uid: any = await verifyToken(token);
    const user = await findUserByAuthId(uid);

    if (user) {
      req.body.userId = user.id;
    } else {
      req.body.authId = uid;
    }

    next();
  } catch (err) {
    // handle err
    console.log("err!!", err);
  }
});

export default router;
