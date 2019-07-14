import { deleteReviews } from "../../../services/review/service";
import { findOrCreateUser, findUsersCount, removeUser } from "../../../services/user/service";
import { deleteVotes } from "../../../services/vote/service";
import { grantAdminRole } from "../../../support/firebaseUtils";

const routes = [
  {
    route: "/users/count",
    method: "GET",
    callback: async (req, res) => {
      const count = await findUsersCount();
      res.send({ count });
    }
  },

  {
    route: "/user/admin/access",
    method: "GET",
    callback: async (req, res) => {
      const count = await findUsersCount();

      if (count > 0) {
        res.send({ status: "Cannot grant admin access!" });
      } else {
        const { email } = req.query;
        const result = await grantAdminRole(email);

        let userId = null;

        if (req.body.userId) {
          userId = req.body.userId;
        } else {
          const user = await findOrCreateUser(req.body.authId);
          userId = user.id;
        }

        res.send({ userId, result });
      }
    }
  },

  {
    route: "/user/id",
    method: "GET",
    callback: async (req, res) => {
      let userId = null;

      if (req.body.userId) {
        userId = req.body.userId;
      } else {
        const user = await findOrCreateUser(req.body.authId);
        userId = user.id;
      }
      res.send({userId});
    }
  },

  {
    route: "/user",
    method: "DELETE",
    callback: async (req, res) => {
      const userId = req.body.userId;

      if (userId) {
        await deleteVotes({ userId });
        await deleteReviews({ userId });
        await removeUser(userId);
        res.send({ status: "success", userId });
      } else {
        res.send({ status: "failure", message: "User not found!" });
      }
    }
  }
];

export default routes;
