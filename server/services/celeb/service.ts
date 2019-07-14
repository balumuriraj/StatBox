import { CelebModel, ICeleb } from "./model";

async function generateCelebsData(celebs: ICeleb[]) {
  const result: any[] = [];

  if (celebs) {
    for (const celeb of celebs) {
      const resultCeleb = await generateCelebData(celeb);
      result.push(resultCeleb);
    }
  }

  return result;
}

async function generateCelebData(celeb: ICeleb) {
  if (celeb) {
    return {
      id: celeb.celebId,
      algoliaId: celeb.algoliaId,
      name: celeb.name,
      photo: celeb.photo,
      dob: celeb.dob
    };
  }
}

export async function createCeleb(celeb: any) {
  const result = await CelebModel.create(celeb);
  return generateCelebData(result);
}

export async function updateCeleb(celebId: number, celeb: any) {
  const result = await CelebModel.update(celebId, celeb);
  return generateCelebData(result);
}

export async function updateCelebAlgoliaIds(celebIds: number[], algoliadIds: string[]) {
  const queries = celebIds.map((celebId) => ({ celebId }));
  const updates = algoliadIds.map((algoliaId) => ({ $set: { algoliaId } }));
  await CelebModel.bulkUpdate(queries, updates);
}

export async function deleteCeleb(celebId: number) {
  return await CelebModel.deleteOne(celebId);
}

export async function findCelebsByQuery(query: any) {
  const celebs = await CelebModel.find([query]);
  return await generateCelebsData(celebs);
}

export async function findCelebsCount() {
  return CelebModel.count();
}

export async function findCelebById(celebId: number) {
  const celeb = await CelebModel.findById(celebId);
  return await generateCelebData(celeb);
}

export async function findCelebsByIds(ids: number[]) {
  const query = [{ celebId: { $in: ids } }];
  const celebs = await CelebModel.find(query);
  return await generateCelebsData(celebs);
}

export async function findAllCelebs() {
  const query = [{}];
  const celebs = await CelebModel.find(query);
  return await generateCelebsData(celebs);
}

export async function findCelebs(limit?: number, skip?: number): Promise<any> {
  const query: any = [];

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

  const celebs = await CelebModel.aggregate(query);
  return generateCelebsData(celebs);
}
