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
    url: review.url,
    rating: review.rating,
    movieId: review.movieId,
    critic: review.critic
  };
}

export async function findReviewById(id: number) {
  const review = await ReviewModel.findById(id);
  return await generateReviewData(review);
}

export async function findReviewsByMovieId(movieId: number) {
  const reviews = await ReviewModel.find({ movieId });
  return await generateReviewsData(reviews);
}

export async function findReviewsCountByMovieId(movieId: number) {
  const where: any = movieId && { movieId };
  const group: any = {
    _id: { movieId: "$movieId" },
    count: { $sum: 1 }
  };

  const query = [
    { $match: where },
    { $group: group }
  ];

  const results = await ReviewModel.aggregate(query);
  return results;
}
