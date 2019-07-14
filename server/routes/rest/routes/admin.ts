import { addObjectsToAlgolia, deleteObjectsInAlgolia, updateObjectsInAlgolia } from "../../../scripts/algoliaSearch";
import { createDatabase, createMovieFromUrl } from "../../../scripts/createDB";
import { addImages, deleteImages } from "../../../scripts/firebaseStorage";
import { findMetas } from "../../../services/meta/service";

const routes = [
  {
    route: "/admin/database/metas",
    method: "GET",
    callback: async (req, res) => {
      const result = await findMetas();
      res.send(result);
    }
  },

  {
    route: "/admin/database/create",
    method: "GET",
    callback: async (req, res) => {
      req.connection.setTimeout( 1000 * 60 * 10 * 60 ); // 10hrs

      if (req.query) {
        const { years, months } = req.query;
        await createDatabase(years.split(",").map(Number), months.split(","));
        res.send(null);
      } else {
        res.send(null);
      }
    }
  },

  {
    route: "/admin/database/create/movie",
    method: "GET",
    callback: async (req, res) => {
      req.connection.setTimeout( 1000 * 60 * 10 * 60 ); // 10hrs

      if (req.query) {
        const { url } = req.query;
        await createMovieFromUrl(url);
        res.send(null);
      } else {
        res.send(null);
      }
    }
  },

  {
    route: "/admin/firebase/add",
    method: "GET",
    callback: async (req, res) => {
      req.connection.setTimeout( 1000 * 60 * 10 * 60 ); // 10hrs
      const { metaId } = req.query;
      const result = await addImages(metaId);
      res.send(result);
    }
  },

  {
    route: "/admin/firebase/delete",
    method: "DELETE",
    callback: async (req, res) => {
      req.connection.setTimeout( 1000 * 60 * 10 * 60 ); // 10hrs
      const { metaId } = req.query;
      const result = await deleteImages(metaId);
      res.send(result);
    }
  },

  {
    route: "/admin/algolia/add",
    method: "GET",
    callback: async (req, res) => {
      req.connection.setTimeout( 1000 * 60 * 10 * 60 ); // 10hrs
      const { metaId } = req.query;
      const result = await addObjectsToAlgolia(metaId);
      res.send(result);
    }
  },

  {
    route: "/admin/algolia/update",
    method: "GET",
    callback: async (req, res) => {
      req.connection.setTimeout( 1000 * 60 * 10 * 60 ); // 10hrs
      const { metaId } = req.query;
      const result = await updateObjectsInAlgolia(metaId);
      res.send(result);
    }
  },

  {
    route: "/admin/algolia/delete",
    method: "DELETE",
    callback: async (req, res) => {
      req.connection.setTimeout( 1000 * 60 * 10 * 60 ); // 10hrs
      const { metaId } = req.query;
      const result = await deleteObjectsInAlgolia(metaId);
      res.send(result);
    }
  }
];

export default routes;
