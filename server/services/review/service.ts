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
    rewatch: review.rewatch,
    story: review.story
  };
}

export async function removeUserReviews(userId: number) {
  return await ReviewModel.deleteMany({ userId });
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

export async function findReviewIdsByUserIds(userIds: number[], skip: number, limit: number) {
  const where: any = { userId: { $in: userIds } };
  const group: any = {
    _id: "$userId",
    reviewIds: { $push: { _id: "$_id" } }
  };

  const query = [
    { $match: where },
    { $group: group },
    { $project: { reviewIds: { $slice: ["$reviewIds", skip, limit] } } }
  ];

  const results = await ReviewModel.aggregate(query);
  const res: any = {};

  results.forEach((result) => {
    res[result._id] = result.reviewIds.map((obj) => obj._id);
  });

  return res;
}

export async function addOrUpdateReview(review: any) {
  if (review) {
    review.timestamp = Date.now();
  }

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

export async function findReviewCountsByUserIds(userIds: number[]) {
  const where: any = { userId: { $in: userIds } };
  const group: any = {
    _id: "$userId",
    count: { $sum: 1 }
  };

  const query = [
    { $match: where },
    { $group: group }
  ];

  const results = await ReviewModel.aggregate(query);
  const counts: any = {};

  results.forEach((result) => {
    counts[result._id] = result.count;
  });

  return counts;
}

export async function findReviewBinsByMovieId(movieId: number) {
  const where: any = movieId && { movieId };
  const group: any = {
    _id: "$review_counts",
    pace_slow_count: { $sum: { $cond: [{ $eq: ["$pace", "slow"] }, 1, 0] } },
    pace_fast_count: { $sum: { $cond: [{ $eq: ["$pace", "fast"] }, 1, 0] } },
    story_simple_count: { $sum: { $cond: [{ $eq: ["$story", "simple"] }, 1, 0] } },
    story_complex_count: { $sum: { $cond: [{ $eq: ["$story", "complex"] }, 1, 0] } },
    rewatch_yes_count: { $sum: { $cond: [{ $eq: ["$rewatch", "yes"] }, 1, 0] } },
    rewatch_no_count: { $sum: { $cond: [{ $eq: ["$rewatch", "no"] }, 1, 0] } },
    watchWith_family_count: { $sum: { $cond: [{ $eq: ["$watchWith", "family"] }, 1, 0] } },
    watchWith_friends_count: { $sum: { $cond: [{ $eq: ["$watchWith", "friends"] }, 1, 0] } },
    watchWith_self_count: { $sum: { $cond: [{ $eq: ["$watchWith", "self"] }, 1, 0] } }
  };
  const project = {
    _id: 0,
    pace: {
      slow: "$pace_slow_count",
      fast: "$pace_fast_count"
    },
    story: {
      simple: "$story_simple_count",
      complex: "$story_complex_count"
    },
    rewatch: {
      yes: "$rewatch_yes_count",
      no: "$rewatch_no_count"
    },
    watchWith: {
      family: "$watchWith_family_count",
      friends: "$watchWith_friends_count",
      self: "$watchWith_self_count"
    }
  };

  const query = [
    { $match: where },
    { $group: group },
    { $project: project }
  ];

  try {
    const results = await ReviewModel.aggregate(query);
    return results && results[0];
  } catch (err) {
    console.log(err);
  }
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
  const bins = {
    0.5: 0,
    1: 0,
    1.5: 0,
    2: 0,
    2.5: 0,
    3: 0,
    3.5: 0,
    4: 0,
    4.5: 0,
    5: 0
  };

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
    rating: { $avg: "$rating" },
    count: { $sum: 1 }
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
        ratings[movieId] = {
          rating: result.rating,
          count: result.count
        };
      }
    });
  }

  return ratings;
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

export async function findTopRatedMovieIds(limit: number, skip: number) {
  const query = [
    {
      $group: {
        _id: { movieId: "$movieId" },
        movieId: { $first: "$movieId" },
        rating: { $avg: "$rating" }
      }
    },
    { $sort: { rating: -1, movieId: -1 } },
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
