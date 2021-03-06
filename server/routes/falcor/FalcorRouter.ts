import * as Router from "falcor-router";
import celebRoutes from "./celeb/routes";
import genreRoutes from "./genre/routes";
import movieRoutes from "./movie/routes";
import pollRoutes from "./poll/routes";
import reviewRoutes from "./review/routes";
import roleRoutes from "./role/routes";
import userRoutes from "./user/routes";
import voteRoutes from "./vote/routes";

/*
{
  moviesById: {
    234: {
      name: "Khaidi No. 150",
      year: 2017,
      poster: "url",
      runtime: 150,
      criticReviews: 3
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
  criticReviewsById: {
    5: {
      url: "url",
      rating: 3
    },
    // more
  },
  criticReviewsByMovieId: {
    234: {
      criticReviews: [
        { $type: "ref", value: ["criticReviewsById", 5] },
        // more
      ]
    }
  }
}
*/

const BaseRouter = Router.createClass([
  ...movieRoutes,
  ...pollRoutes,
  ...celebRoutes,
  ...roleRoutes,
  ...genreRoutes,
  ...userRoutes,
  ...reviewRoutes,
  ...voteRoutes
]);

class FalcorRouter extends BaseRouter {
  public userId: number;

  constructor(userId: number) {
    super();
    this.userId = userId;
  }
}

export default FalcorRouter;
