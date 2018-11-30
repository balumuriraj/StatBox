import { GenreModel, IGenre } from "./model";

async function generateGenreData(genre: IGenre) {
  return {
    id: genre._id,
    name: genre.name,
    movieIds: genre.movieIds
  };
}

export async function findGenreById(id: number) {
  const genre = await GenreModel.findById(id);
  return await generateGenreData(genre);
}

export async function findGenresCount() {
  const query = [
    { $count: "count" }
  ];

  const results = await GenreModel.aggregate(query);
  return results && results[0] && results[0].count || 0;
}

export async function findMovieCountByGenreId(id: number) {
  const project: any = {
    name: 1,
    count: { $size: "$movieIds" }
  };
  const where: any = { _id: id };
  const query = [
    { $project: project },
    { $match: where }
  ];

  const results = await GenreModel.aggregate(query);
  return results && results[0] && results[0].count || 0;
}
