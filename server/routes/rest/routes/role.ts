import { findCelebById, findCelebsByIds } from "../../../services/celeb/service";
import { findMovieById, findMoviesByIds } from "../../../services/movie/service";
import { createRole, deleteRole, findRoleById, findRolesByCelebIds, findRolesByMovieIds, updateRole } from "../../../services/role/service";

const routes = [
  {
    route: "/roles/movie/:id",
    method: "GET",
    callback: async (req, res) => {
      const id = Number(req.params.id);
      const movieRoles = await findRolesByMovieIds([id]);
      const celebIds = movieRoles.map((role) => role.celebId);
      const celebs = await findCelebsByIds(celebIds);

      const roles = [];

      for (const role of movieRoles) {
        const celeb = celebs.find((celeb) => celeb.id === role.celebId);
        roles.push({ ...role, celeb });
      }

      res.send(roles);
    }
  },

  {
    route: "/roles/celeb/:id",
    method: "GET",
    callback: async (req, res) => {
      const id = Number(req.params.id);
      const celebRoles = await findRolesByCelebIds([id]);
      const movieIds = celebRoles.map((role) => role.movieId);
      const movies = await findMoviesByIds(movieIds);

      const roles = [];

      for (const role of celebRoles) {
        const movie = movies.find((movie) => movie.id === role.movieId);
        roles.push({ ...role, movie });
      }

      res.send(roles);
    }
  },

  {
    route: "/role/:id",
    method: "GET",
    callback: async (req, res) => {
      const id = req.params.id;
      const result = await findRoleById(id);
      const celeb = await findCelebById(result.celebId);
      const movie = await findMovieById(result.movieId);
      res.send({ ...result, celeb, movie });
    }
  },

  {
    route: "/admin/role",
    method: "POST",
    callback: async (req, res) => {
      const role = req.body;
      const result = await createRole(role);
      const celeb = await findCelebById(result.celebId);
      const movie = await findMovieById(result.movieId);
      res.send({ ...result, celeb, movie });
    }
  },

  {
    route: "/admin/role/:id",
    method: "PUT",
    callback: async (req, res) => {
      const id = req.params.id;
      const role = req.body;
      const result = await updateRole(id, role);
      const celeb = await findCelebById(result.celebId);
      const movie = await findMovieById(result.movieId);
      res.send({ ...result, celeb, movie });
    }
  },

  {
    route: "/admin/role/:id",
    method: "DELETE",
    callback: async (req, res) => {
      const id = req.params.id;
      const result = await deleteRole(id);
      res.send(result);
    }
  }
];

export default routes;
