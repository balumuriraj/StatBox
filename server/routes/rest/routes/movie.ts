import { updateGenres } from "../../../services/genre/service";
import { createMeta, findMetaByQuery, updateMeta, updateMetas } from "../../../services/meta/service";
import { createMovie, deleteMovie, findMovieById, findMoviesByFilter, findMoviesByIds, findMoviesByTerm, findMoviesCount, updateMovie } from "../../../services/movie/service";
import { deleteReviews } from "../../../services/review/service";
import { deleteRoles } from "../../../services/role/service";
import {  updateUsers } from "../../../services/user/service";
import { deleteVotes } from "../../../services/vote/service";

const routes = [
  {
    route: "/movies/count",
    method: "GET",
    callback: async (req, res) => {
      const count = await findMoviesCount();
      res.send({ count });
    }
  },

  {
    route: "/movies",
    method: "GET",
    callback: async (req, res) => {
      const skip = req.query.skip ? Number(req.query.skip) : 0;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const movieIds = await findMoviesByFilter([], [], "movieId", limit, skip);
      const movies = await findMoviesByIds(movieIds);
      res.send(movies);
    }
  },

  {
    route: "/movie/:id",
    method: "GET",
    callback: async (req, res) => {
      const id = req.params.id;
      const movies = await findMoviesByIds([id]);
      res.send(movies[0]);
    }
  },

  {
    route: "/admin/movie",
    method: "POST",
    callback: async (req, res) => {
      const movie = req.body;
      const result = await createMovie(movie);

      const meta = await findMetaByQuery({ type: "add", years: null, months: null, algoliaUpdatedAt: null });

      if (meta) {
        await updateMeta(meta.id, { $addToSet: { movieIds: result.id } });
      } else {
        await createMeta({
          movieIds: [result.id],
          celebIds: [],
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
    route: "/admin/movie/:id",
    method: "PUT",
    callback: async (req, res) => {
      const id = req.params.id;
      const movie = req.body;
      const result = await updateMovie(id, movie);

      const meta = await findMetaByQuery({ type: "update", years: null, months: null, algoliaUpdatedAt: null });

      if (meta) {
        await updateMeta(meta.id, { $addToSet: { movieIds: result.id } });
      } else {
        await createMeta({
          movieIds: [result.id],
          celebIds: [],
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
    route: "/admin/movie/:id",
    method: "DELETE",
    callback: async (req, res) => {
      const id = req.params.id;
      const movie = await findMovieById(id);
      const result = await deleteMovie(id);
      await updateGenres({}, { $pull: { movieIds: id } });
      await updateMetas({}, { $pull: { movieIds: id } });
      await updateUsers({}, { $pull: { bookmarks: id, favorites: id } });
      await deleteReviews({ movieId: id });
      await deleteRoles({ movieId: id });
      await deleteVotes({ movieId: id });

      const meta = await findMetaByQuery({ type: "delete", years: null, months: null, firebaseUpdatedAt: null, algoliaUpdatedAt: null });

      if (meta) {
        await updateMeta(meta.id, { $addToSet: { movieIds: id }, algoliaMovieIds: movie.algoliaId });
      } else {
        await createMeta({
          movieIds: [id],
          celebIds: [],
          algoliaMovieIds: [movie.algoliaId],
          algoliaCelebIds: [],
          years: null,
          months: null,
          type: "delete"
        });
      }

      res.send(result);
    }
  },

  {
    route: "/movie/search",
    method: "GET",
    callback: async (req, res) => {
      if (req.query) {
        const { content, term } = req.query;
        const result = content === "movies" ? await findMoviesByTerm(term) : null;
        res.send(result);
      } else {
        res.send(null);
      }
    }
  }
];

export default routes;
