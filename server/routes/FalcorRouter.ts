import * as Router from "falcor-router";
import celebRoutes from "./celeb/routes";
import criticRoutes from "./critic/routes";
import movieRoutes from "./movie/routes";
import reviewRoutes from "./review/routes";
import roleRoutes from "./role/routes";
import userRoutes from "./user/routes";

/*
{
  moviesById: {
    234: {
      name: "Khaidi No. 150",
      year: 2017,
      poster: "url",
      runtime: 150,
      reviews: 3
    },
    // more
  },
  moviesByYear: {
    2017 : {
      movies: [
        { $type: "ref", value: ["moviesById", 234] },
        // more
      ]
    },
    // more
  },
  moviesByYearMonth: {
    2017: {
      1: {
        movies: [
          { $type: "ref", value: ["moviesById", 234] },
          // more
        ]
      },
      // more
    },
    // more
  },
  reviewsById: {
    5: {
      url: "url",
      rating: 3
    },
    // more
  },
  reviewsByMovieId: {
    234: {
      reviews: [
        { $type: "ref", value: ["reviewsById", 5] },
        // more
      ]
    }
  }
}
*/

const FalcorRouter = Router.createClass([
  ...movieRoutes,
  ...reviewRoutes,
  ...celebRoutes,
  ...roleRoutes,
  ...criticRoutes,
  ...userRoutes
]);

export default new FalcorRouter();
