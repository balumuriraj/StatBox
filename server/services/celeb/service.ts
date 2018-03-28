import { CelebModel, ICeleb } from "./model";

async function generateCelebsData(celebs: ICeleb[]) {
  const result: any[] = [];

  for (const celeb of celebs) {
    const resultCeleb = await generateCelebData(celeb);
    result.push(resultCeleb);
  }

  return result;
}

async function generateCelebData(celeb: ICeleb) {
  return {
    id: celeb._id,
    name: celeb.name,
    photo: celeb.photo,
    dob: celeb.dob
  };
}

export async function findCelebById(id: number) {
  const celeb = await CelebModel.findById(id);
  return await generateCelebData(celeb);
}

export async function findCelebsByMovieId(movieId: number) {
  const celebs = await CelebModel.find({ movieIds: { $all: movieId } });
  return await generateCelebsData(celebs);
}

export async function findCelebsCountByMovieId(movieId: number) {
  const celebs = await CelebModel.find({ movieIds: { $all: movieId } });
  return celebs.length;
}
