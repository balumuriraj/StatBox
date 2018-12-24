import { IReview, ReviewModel } from "./model";

async function generateReviewsData(reviews: IReview[]) {
  const result: any[] = [];

  for (const review of reviews) {
    const resultReview = await generateReviewData(review);
    result.push(resultReview);
  }

  return result;
}

async function generateReviewData(review: IReview) {
  return {
    id: review._id,
    userId: review.userId,
    rating: review.rating,
    movieId: review.movieId,
    watchWith: review.watchWith,
    pace: review.pace,
    theme: review.theme,
    plot: review.plot
  };
}

export async function findReviewsByIds(ids: number[]) {
  const query = { _id: { $in: ids } };
  const reviews = await ReviewModel.find(query);
  return await generateReviewsData(reviews);
}

export async function findUserReviewsByMovieIds(userId: number, movieIds: number[]) {
  const query = { movieId: { $in: movieIds }, userId };
  const reviews = await ReviewModel.find(query);
  return await generateReviewsData(reviews);
}

export async function findReviewsByMovieId(movieId: number) {
  const reviews = await ReviewModel.find({ movieId });
  return await generateReviewsData(reviews);
}

export async function findReviewsByMovieIds(movieIds: number[]) {
  const query = { movieId: { $in: movieIds } };
  const reviews = await ReviewModel.find(query);
  return await generateReviewsData(reviews);
}

export async function findReviewsByUserId(userId: number) {
  const reviews = await ReviewModel.find({ userId });
  return await generateReviewsData(reviews);
}

export async function findReviewsByUserIds(userIds: number[]) {
  const query = { userId: { $in: userIds } };
  const reviews = await ReviewModel.find(query);
  return await generateReviewsData(reviews);
}

export async function addOrUpdateReview(review: any) {
  const query = { userId: review.userId, movieId: review.movieId };
  const result = await ReviewModel.update(query, review);
  return await generateReviewData(result);
}

export async function findReviewsCountByUserId(userId: number) {
  const where: any = userId && { userId };
  const group: any = {
    _id: { userId: "$userId" },
    count: { $sum: 1 }
  };

  const query = [
    { $match: where },
    { $group: group }
  ];

  const results = await ReviewModel.aggregate(query);
  return results[0] && results[0].count || 0;
}

export async function findRatingBinsByMovieId(movieId: number) {
  const where: any = movieId && { movieId };
  const group: any = {
    _id: { rating: "$rating" },
    count: { $sum: 1 }
  };

  const query = [
    { $match: where },
    { $group: group }
  ];

  const results = await ReviewModel.aggregate(query);
  const bins = {};

  if (results) {
    results.forEach((result) => {
      const rating = result._id.rating;

      if (rating) {
        bins[rating] = result.count;
      }
    });
  }

  return bins;
}

export async function findRatingsByMovieIds(movieIds: number[]) {
  const where: any = { movieId: { $in: movieIds }, rating: { $ne: null } };
  const group: any = {
    _id: { movieId: "$movieId" },
    rating: { $avg: "$rating" }
  };

  const query = [
    { $match: where },
    { $group: group }
  ];

  const results = await ReviewModel.aggregate(query);
  const ratings = {};

  if (results) {
    results.forEach((result) => {
      const movieId = result._id.movieId;

      if (movieId) {
        ratings[movieId] = result.rating;
      }
    });
  }

  return ratings;
}

export async function findRatingsCountByMovieIds(movieIds: number[]) {
  const where: any = { movieId: { $in: movieIds }, rating: { $ne: null } };
  const group: any = {
    _id: { movieId: "$movieId" },
    count: { $sum: 1 }
  };

  const query = [
    { $match: where },
    { $group: group }
  ];

  const results = await ReviewModel.aggregate(query);
  const ratingsCount = {};

  if (results) {
    results.forEach((result) => {
      const movieId = result._id.movieId;

      if (movieId) {
        ratingsCount[movieId] = result.count;
      }
    });
  }

  return ratingsCount;
}

export async function findPopularMoviesCount() {
  const query = [
    {
      $group: {
        _id: { movieId: "$movieId" },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 }
      }
    }
  ];

  const results = await ReviewModel.aggregate(query);
  return results && results[0] && results[0].count || 0;
}

export async function findPopularMovieIds(limit: number, skip: number) {
  const query = [
    {
      $group: {
        _id: { movieId: "$movieId" },
        movieId: { $first: "$movieId" },
        rating: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1, rating: -1, movieId: -1 } },
    { $skip: skip },
    { $limit: limit }
  ];

  const results = await ReviewModel.aggregate(query);
  const movieIds = [];

  if (results) {
    results.forEach((result) => {
      const movieId = result._id.movieId;

      if (movieId) {
        movieIds.push({
          movieId,
          rating: result.rating,
          count: result.count
        });
      }
    });
  }

  return movieIds;
}
