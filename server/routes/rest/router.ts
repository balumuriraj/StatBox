import * as express from "express";
import adminRoutes from "./routes/admin";
import celebRoutes from "./routes/celeb";
import movieRoutes from "./routes/movie";
import pollRoutes from "./routes/poll";
import roleRoutes from "./routes/role";
import userRoutes from "./routes/user";

const router = express.Router();

router.use("/admin/", async (req, res, next) => {
  if (!req.body.isAdmin) {
    res.status(403).json("Not Allowed");
  }

  next();
});

function addRoutes(routes: Array<{ route: string, method: string, callback: (req: any, res: any) => Promise<void> }>) {
  routes.forEach(({ route, method, callback }) => {
    if (method === "GET") {
      router.route(route).get(callback);
    } else if (method === "POST") {
      router.route(route).post(callback);
    } else if (method === "PUT") {
      router.route(route).put(callback);
    } else if (method === "DELETE") {
      router.route(route).delete(callback);
    }
  });
}

addRoutes(adminRoutes);
addRoutes(movieRoutes);
addRoutes(celebRoutes);
addRoutes(roleRoutes);
addRoutes(pollRoutes);
addRoutes(userRoutes);

export default router;
