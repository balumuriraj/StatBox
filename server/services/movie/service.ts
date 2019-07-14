import { IMovie, MovieModel } from "./model";

async function generateMoviesData(movies: IMovie[]) {
  const result: any[] = [];

  if (movies) {
    for (const movie of movies) {
      const resultMovie = await generateMovieData(movie);
      result.push(resultMovie);
    }
  }

  return result;
}

async function generateMovieData(movie: any) {
  if (movie) {
    return {
      id: movie.movieId,
      algoliaId: movie.algoliaId,
      title: movie.title,
      description: movie.description,
      cert: movie.cert,
      poster: movie.poster,
      genre: movie.genre,
      runtime: movie.runtime,
      releaseDate: movie.releaseDate,
      year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null,
      rating: movie.rating,
      ratingsCount: movie.ratingsCount
    };
  }
}

export async function createMovie(movie: any) {
  const result = await MovieModel.create(movie);
  return generateMovieData(result);
}

export async function updateMovie(movieId: number, movie: any) {
  const result = await MovieModel.update(movieId, movie);
  return generateMovieData(result);
}

export async function updateMovieAlgoliaIds(movieIds: number[], algoliadIds: string[]) {
  const queries = movieIds.map((movieId) => ({ movieId }));
  const updates = algoliadIds.map((algoliaId) => ({ $set: { algoliaId } }));
  await MovieModel.bulkUpdate(queries, updates);
}

export async function deleteMovie(movieId: number) {
  return await MovieModel.deleteOne(movieId);
}

export async function findMoviesCount() {
  return MovieModel.count();
}

export async function findMovieById(movieId: number) {
  const movie = await MovieModel.findById(movieId);
  return await generateMovieData(movie);
}

export async function findMoviesByIds(ids: number[], includeRating: boolean = false) {
  if (!includeRating) {
    const query = [{ movieId: { $in: ids } }];
    const movies = await MovieModel.find(query);
    return await generateMoviesData(movies);
  } else {
    const where = { movieId: { $in: ids } };
    const lookup = {
      from: "Reviews",
      localField: "movieId",
      foreignField: "movieId",
      as: "reviews"
    };
    const project = {
      movieId: "$movieId",
      genre: "$genre",
      title: "$title",
      cert: "$cert",
      poster: "$poster",
      runtime: "$runtime",
      releaseDate: "$releaseDate",
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
    year: { $year: "$releaseDate" }
  };
  const where: any = year && { year };
  const group: any = {
    _id: { year: "$year" },
    count: { $sum: 1 }
  };

  if (month) {
    fields.month = { $month: "$releaseDate" };
    where.month = month;
    group._id.month = "$month";
  }

  if (day) {
    fields.day = { $dayOfMonth: "$releaseDate" };
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
    year: { $year: "$releaseDate" }
  };
  const where: any = { year };

  if (month) {
    fields.month = { $month: "$releaseDate" };
    where.month = month;
  }

  if (day) {
    fields.day = { $dayOfMonth: "$releaseDate" };
    where.day = day;
  }

  const query = [
    { $addFields: fields },
    { $match: where },
    { $sort: { releaseDate: -1 } },
    { $limit: skip + limit },
    { $skip: skip }
  ];
  const movies = await MovieModel.aggregate(query);
  return await generateMoviesData(movies);
}

export async function sortMovieIds(ids: number[], sortBy: string, limit: number, skip: number) {
  const query = [
    {
      movieId: { $in: ids }
    },
    {
      movieId: 1
    }
  ];
  const sort = {};
  sort[sortBy] = 1; // ascending order

  const movies = await MovieModel.find(query, sort, limit, skip);
  return movies.map((movie) => movie.movieId);
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

export async function findMoviesByQuery(query: any) {
  const movies = await MovieModel.find([query]);
  return await generateMoviesData(movies);
}

export async function findMoviesCountByYears() {
  const fields: any = {
    year: { $year: "$releaseDate" }
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
            $year: "$releaseDate"
          },
          genre: 1,
          releaseDate: 1,
          title: 1,
          movieId: 1
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

export async function findMoviesByFilter(genres: string[], years: string[], sortBy: string, limit?: number, skip?: number): Promise<any> {
  const query: any = [];

  if (years && years.length) {
    query.push(
      {
        $project: {
          year: {
            $year: "$releaseDate"
          },
          genre: 1,
          releaseDate: 1,
          title: 1,
          movieId: 1
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
            localField: "movieId",
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
            reviewsCount: -1, releaseDate: -1, title: 1, movieId: 1
          }
        }
      );
    } else if (sortBy === "rating") {
      query.push(
        {
          $lookup: {
            from: "Reviews",
            localField: "movieId",
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
            rating: -1, releaseDate: -1, title: 1, movieId: 1
          }
        }
      );
    } else {
      const sort: any = {};
      sort[sortBy] = 1; // ascending order
      sort["movieId"] = 1;

      query.push({
        $sort: sort
      });
    }
  } else {
    query.push({
      $sort: { releaseDate: -1, title: 1, movieId: 1 }
    });
  }

  query.push(
    {
      $project: {
        movieId: 1
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
  return movieIds.map(({ movieId }) => movieId);
}

