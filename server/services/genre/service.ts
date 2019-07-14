import { GenreModel, IGenre } from "./model";

async function generateGenresData(genres: IGenre[]) {
  const result: any[] = [];

  if (genres) {
    for (const genre of genres) {
      const resultGenre = await generateGenreData(genre);
      result.push(resultGenre);
    }
  }

  return result;
}

async function generateGenreData(genre: IGenre) {
  if (genre) {
    return {
      id: genre.genreId,
      name: genre.name,
      movieIds: genre.movieIds
    };
  }
}

export async function createGenre(data: any) {
  const result = await GenreModel.create(data);
  return generateGenreData(result);
}

export async function updateGenre(genreId: number, update: any) {
  const result = await GenreModel.findByIdAndUpdate(genreId, update);
  return generateGenreData(result);
}

export async function updateGenres(query: any, update: any) {
  return await GenreModel.updateMany(query, update);
}

export async function findGenresByQuery(query: any) {
  const genres = await GenreModel.find([query]);
  return await generateGenresData(genres);
}

export async function findGenresByIds(ids: number[]) {
  const query = { genreId: { $in: ids } };
  const genres = await GenreModel.find([query]);
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
  const where: any = { genreId: id };
  const query = [
    { $project: project },
    { $match: where }
  ];

  const results = await GenreModel.aggregate(query);
  return results && results[0] && results[0].count || 0;
}
