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

export async function findCelebsByIds(ids: number[]) {
  const query = [{ _id: { $in: ids } }];
  const celebs = await CelebModel.find(query);
  return await generateCelebsData(celebs);
}

export async function findAllCelebs() {
  const query = [{}];
  const celebs = await CelebModel.find(query);
  return await generateCelebsData(celebs);
}

