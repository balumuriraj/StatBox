import { CriticReviewModel, ICriticReview } from "./model";

async function generateCriticReviewsData(reviews: ICriticReview[]) {
  const result: any[] = [];

  for (const review of reviews) {
    const resultCriticReview = await generateCriticReviewData(review);
    result.push(resultCriticReview);
  }

  return result;
}

async function generateCriticReviewData(review: ICriticReview) {
  return {
    id: review._id,
    url: review.url,
    rating: review.rating,
    movieId: review.movieId,
    critic: review.critic
  };
}

export async function findCriticReviewById(id: number) {
  const review = await CriticReviewModel.findById(id);
  return await generateCriticReviewData(review);
}

export async function findCriticReviewsByMovieId(movieId: number) {
  const reviews = await CriticReviewModel.find({ movieId });
  return await generateCriticReviewsData(reviews);
}

export async function findCriticReviewsCountByMovieId(movieId: number) {
  const where: any = movieId && { movieId };
  const group: any = {
    _id: { movieId: "$movieId" },
    count: { $sum: 1 }
  };

  const query = [
    { $match: where },
    { $group: group }
  ];

  const results = await CriticReviewModel.aggregate(query);
  return results;
}
