import { createCeleb, deleteCeleb, findCelebById, findCelebs, findCelebsByIds, findCelebsCount, updateCeleb } from "../../../services/celeb/service";
import { createMeta, findMetaByQuery, updateMeta, updateMetas } from "../../../services/meta/service";
import { deleteRoles } from "../../../services/role/service";

const routes = [
  {
    route: "/celebs/count",
    method: "GET",
    callback: async (req, res) => {
      const count = await findCelebsCount();
      res.send({ count });
    }
  },

  {
    route: "/celebs",
    method: "GET",
    callback: async (req, res) => {
      const skip = Number(req.query.skip);
      const limit = Number(req.query.limit);
      const celebs = await findCelebs(limit, skip);
      res.send(celebs);
    }
  },

  {
    route: "/celeb/:id",
    method: "GET",
    callback: async (req, res) => {
      const id = req.params.id;
      const celeb = await findCelebById(id);
      res.send(celeb);
    }
  },

  {
    route: "/admin/celeb",
    method: "POST",
    callback: async (req, res) => {
      const celeb = req.body;
      const result = await createCeleb(celeb);

      const meta = await findMetaByQuery({ type: "add", years: null, months: null, algoliaUpdatedAt: null });

      if (meta) {
        await updateMeta(meta.id, { $addToSet: { celebIds: result.id } });
      } else {
        await createMeta({
          movieIds: [],
          celebIds: [result.id],
          years: null,
          months: null,
          firebaseUpdatedAt: Date.now(),
          type: "add"
        });
      }

      res.send(result);
    }
  },

  {
    route: "/admin/celeb/:id",
    method: "PUT",
    callback: async (req, res) => {
      const id = req.params.id;
      const celeb = req.body;
      const result = await updateCeleb(id, celeb);

      const meta = await findMetaByQuery({ type: "update", years: null, months: null, algoliaUpdatedAt: null });

      if (meta) {
        await updateMeta(meta.id, { $addToSet: { celebIds: result.id } });
      } else {
        await createMeta({
          movieIds: [],
          celebIds: [result.id],
          years: null,
          months: null,
          firebaseUpdatedAt: Date.now(),
          type: "update"
        });
      }

      res.send(result);
    }
  },

  {
    route: "/admin/celeb/:id",
    method: "DELETE",
    callback: async (req, res) => {
      const id = req.params.id;
      const celeb = await findCelebById(id);
      const result = await deleteCeleb(id);
      await updateMetas({}, { $pull: { celebIds: id } });
      await deleteRoles({ celebId: id });

      const meta = await findMetaByQuery({ type: "delete", years: null, months: null, firebaseUpdatedAt: null, algoliaUpdatedAt: null });

      if (meta) {
        await updateMeta(meta.id, { $addToSet: { celebIds: id, algoliaCelebIds: celeb.algoliaId } });
      } else {
        await createMeta({
          movieIds: [],
          celebIds: [id],
          algoliaMovieIds: [],
          algoliaCelebIds: [celeb.algoliaId],
          years: null,
          months: null,
          type: "delete"
        });
      }

      res.send(result);
    }
  }
];

export default routes;
