import { GenreModel, IGenre } from "./model";

async function generateGenresData(genres: IGenre[]) {
  const result: any[] = [];

  for (const genre of genres) {
    const resultGenre = await generateGenreData(genre);
    result.push(resultGenre);
  }

  return result;
}

async function generateGenreData(genre: IGenre) {
  return {
    id: genre._id,
    name: genre.name,
    movieIds: genre.movieIds
  };
}

export async function findGenresByIds(ids: number[]) {
  const query = { _id: { $in: ids } };
  const genres = await GenreModel.find(query);
  return await generateGenresData(genres);
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
