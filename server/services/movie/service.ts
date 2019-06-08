import { IMovie, MovieModel } from "./model";

async function generateMoviesData(movies: IMovie[]) {
  const result: any[] = [];

  for (const movie of movies) {
    const resultMovie = await generateMovieData(movie);
    result.push(resultMovie);
  }

  return result;
}

async function generateMovieData(movie: any) {
  return {
    id: movie._id,
    title: movie.title,
    description: movie.description,
    cert: movie.cert,
    poster: movie.poster,
    genre: movie.genre,
    runtime: movie.runtime,
    releasedate: movie.releasedate,
    rating: movie.rating,
    ratingsCount: movie.ratingsCount
  };
}

export async function findMoviesByIds(ids: number[], includeRating: boolean = false) {
  if (!includeRating) {
    const query = [{ _id: { $in: ids } }];
    const movies = await MovieModel.find(query);
    return await generateMoviesData(movies);
  } else {
    const where = { _id: { $in: ids } };
    const lookup = {
      from: "Reviews",
      localField: "_id",
      foreignField: "movieId",
      as: "reviews"
    };
    const project = {
      genre: "$genre",
      title: "$title",
      cert: "$cert",
      poster: "$poster",
      runtime: "$runtime",
      releasedate: "$releasedate",
      rating: { $avg: "$reviews.rating" },
      ratingsCount: { $size: "$reviews" }
    };
    const query = [
      { $match: where },
      { $lookup: lookup },
      { $project: project }
    ];
    const results = await MovieModel.aggregate(query);
    return await generateMoviesData(results);
  }
}

export async function findMoviesCountByDate(date: number[]) {
  const [year, month, day] = date;
  const fields: any = {
    year: { $year: "$releasedate" }
  };
  const where: any = year && { year };
  const group: any = {
    _id: { year: "$year" },
    count: { $sum: 1 }
  };

  if (month) {
    fields.month = { $month: "$releasedate" };
    where.month = month;
    group._id.month = "$month";
  }

  if (day) {
    fields.day = { $dayOfMonth: "$releasedate" };
    where.day = day;
    group._id.day = "$day";
  }

  const query = [
    { $project: fields },
    { $match: where },
    { $group: group }
  ];

  const results = await MovieModel.aggregate(query);
  return results[0].count;
}

export async function findMoviesByDate(date: number[], limit: number, skip: number) {
  const [year, month, day] = date;
  const fields: any = {
    year: { $year: "$releasedate" }
  };
  const where: any = { year };

  if (month) {
    fields.month = { $month: "$releasedate" };
    where.month = month;
  }

  if (day) {
    fields.day = { $dayOfMonth: "$releasedate" };
    where.day = day;
  }

  const query = [
    { $addFields: fields },
    { $match: where },
    { $sort: { releasedate: -1 } },
    { $limit: skip + limit },
    { $skip: skip }
  ];
  const movies = await MovieModel.aggregate(query);
  return await generateMoviesData(movies);
}

export async function findMoviesCountBetweenDates(date1: any, date2: any) {
  const query = [
    {
      $match: {
        releasedate: {
          $gte: new Date(date1),
          $lt: new Date(date2)
        }
      }
    },
    { $count: "count" }
  ];

  const results = await MovieModel.aggregate(query);
  return results && results[0] && results[0].count || 0;
}

export async function findMoviesBetweenDates(date1: any, date2: any, limit: number, skip: number) {
  const query = [
    {
      releasedate: {
        $gte: new Date(date1),
        $lt: new Date(date2)
      }
    }
  ];

  const sort = { releasedate: -1 };

  const movies = await MovieModel.find(query, sort, limit, skip);
  return await generateMoviesData(movies);
}

export async function sortMovieIds(ids: number[], sortBy: string, limit: number, skip: number) {
  const query = [
    {
      _id: { $in: ids }
    },
    {
      _id: 1
    }
  ];
  const sort = {};
  sort[sortBy] = 1; // ascending order

  const movies = await MovieModel.find(query, sort, limit, skip);
  return movies.map((movie) => movie._id);
}

// Full text search
export async function findMoviesByTerm(term: string) {
  const query = [
    { $text: { $search: term } },
    { score: { $meta: "textScore" } }
  ];
  const sort = { score: { $meta: "textScore" } };
  const movies = await MovieModel.find(query, sort, 10);
  return await generateMoviesData(movies);
}

export async function findAllMovies() {
  const query = [];
  const movies = await MovieModel.find(query);
  return await generateMoviesData(movies);
}

export async function findMoviesCountByYears() {
  const fields: any = {
    year: { $year: "$releasedate" }
  };
  const group: any = {
    _id: { year: "$year" },
    count: { $sum: 1 }
  };
  const query = [
    { $addFields: fields },
    { $group: group }
  ];

  const results = await MovieModel.aggregate(query);
  const bins = {};

  if (results) {
    results.forEach((result) => {
      const rating = result._id.year;

      if (rating) {
        bins[rating] = result.count;
      }
    });
  }

  return bins;
}

export async function findMoviesByFilterCount(genres: number[], years: number[]) {
  const query: any = [];

  if (years && years.length) {
    query.push(
      {
        $project: {
          year: {
            $year: "$releasedate"
          },
          genre: 1,
          releasedate: 1,
          title: 1
        }
      }, {
        $match: {
          year: {
            $in: years
          }
        }
      }
    );
  }

  if (genres && genres.length) {
    query.push(
      {
        $match: {
          genre: {
            $elemMatch: { $in: genres }
          }
        }
      }
    );
  }

  query.push({
    $count: "count"
  });

  const results = await MovieModel.aggregate(query);
  return results[0].count;
}

export async function findMoviesByFilter(genres: string[], years: number[], sortBy: string, limit?: number, skip?: number): Promise<any> {
  const query: any = [];

  if (years && years.length) {
    query.push(
      {
        $project: {
          year: {
            $year: "$releasedate"
          },
          genre: 1,
          releasedate: 1,
          title: 1
        }
      }, {
        $match: {
          year: {
            $in: years
          }
        }
      }
    );
  }

  // TODO: use $and

  if (genres && genres.length) {
    query.push(
      {
        $match: {
          genre: {
            $elemMatch: { $in: genres }
          }
        }
      }
    );
  }

  if (sortBy) {
    if (sortBy === "popularity") {
      query.push(
        {
          $lookup: {
            from: "Reviews",
            localField: "_id",
            foreignField: "movieId",
            as: "reviews"
          }
        }, {
          $project: {
            reviewsCount: {
              $size: "$reviews"
            }
          }
        }, {
          $sort: {
            reviewsCount: -1, releasedate: -1, title: 1, _id: 1
          }
        }
      );
    } else if (sortBy === "rating") {
      query.push(
        {
          $lookup: {
            from: "Reviews",
            localField: "_id",
            foreignField: "movieId",
            as: "reviews"
          }
        }, {
          $project: {
            rating: {
              $avg: "$reviews.rating"
            }
          }
        }, {
          $sort: {
            rating: -1, releasedate: -1, title: 1, _id: 1
          }
        }
      );
    } else {
      const sort: any = {};
      sort[sortBy] = 1; // ascending order
      sort["_id"] = 1;

      query.push({
        $sort: sort
      });
    }
  } else {
    query.push({
      $sort: { releasedate: -1, title: 1, _id: 1 }
    });
  }

  query.push(
    {
      $project: {
        _id: 1
      }
    }
  );

  if (skip) {
    query.push({
      $skip: skip
    });
  }

  if (limit) {
    query.push({
      $limit: limit
    });
  }

  const movieIds = await MovieModel.aggregate(query);
  return movieIds.map(({ _id }) => _id);
}

// {
//   $unwind: {
//     path: "$genre"
//   }
// }, {
//   $lookup: {
//     from: "Genres",
//     localField: "genre",
//     foreignField: "name",
//     as: "genres_docs"
//   }
// }, {
//   $project: {
//     genreId: "$genres_docs._id"
//   }
// }, {
//   $match: {
//     genreId: {
//       $in: genreIds
//     }
//   }
// }, {
//   $group: {
//     _id: null,
//     movieIds: {
//       $addToSet: "$_id"
//     }
//   }
// }, {
//   $unwind: {
//     path: "$movieIds"
//   }
// }, {
//   $project: {
//     _id: "$movieIds"
//   }
// }
