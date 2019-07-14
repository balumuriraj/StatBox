import algoliasearch = require("algoliasearch");
import { findCelebsByIds, updateCelebAlgoliaIds } from "../services/celeb/service";
import { findMetaById, updateMeta } from "../services/meta/service";
import { findMoviesByIds, updateMovieAlgoliaIds } from "../services/movie/service";

const client = algoliasearch("8P9LT48GR4", "c87e0ed7b9d9e6a37062c36f47fdf591");
const moviesIndex = client.initIndex("movies");
const celebsIndex = client.initIndex("celebs");

export async function addObjectsToAlgolia(metaId: number) {
  console.log("addObjectsToAlgolia push started!");
  const startTime = Date.now();

  const meta = await findMetaById(metaId);

  if (!meta) {
    return;
  }

  const movieRecords = await findMoviesByIds(meta.movieIds);
  const algoliaIdsForMovies: string[] = [];
  while (movieRecords.length) {
    const result: any = await moviesIndex.addObjects(movieRecords.splice(0, 10000));
    algoliaIdsForMovies.push(...result.objectIDs);
  }

  const celebRecords = await findCelebsByIds(meta.celebIds);
  const algoliaIdsForCelebs: string[] = [];
  while (celebRecords.length) {
    const result: any = await celebsIndex.addObjects(celebRecords.splice(0, 10000));
    algoliaIdsForCelebs.push(...result.objectIDs);
  }

  await updateMovieAlgoliaIds(meta.movieIds, algoliaIdsForMovies);
  await updateCelebAlgoliaIds(meta.celebIds, algoliaIdsForCelebs);

  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 60000;
  console.log(`addObjectsToAlgolia push completed!! TimeTaken: ${timeTaken} Mins`);

  return await updateMeta(meta.id, { algoliaUpdatedAt: Date.now() });
}

export async function updateObjectsInAlgolia(metaId: number) {
  console.log("updateObjectsInAlgolia push started!");
  const startTime = Date.now();

  const meta = await findMetaById(metaId);

  if (!meta) {
    return;
  }

  const movieRecords = await findMoviesByIds(meta.movieIds);
  movieRecords.forEach((record) => {
    record.objectID = record.algoliaId;
    delete record.algoliaId;
  });
  while (movieRecords.length) {
    await moviesIndex.saveObjects(movieRecords.splice(0, 10000));
  }

  const celebRecords = await findCelebsByIds(meta.celebIds);
  celebRecords.forEach((record) => {
    record.objectID = record.algoliaId;
    delete record.algoliaId;
  });
  while (celebRecords.length) {
    await celebsIndex.saveObjects(celebRecords.splice(0, 10000));
  }

  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 60000;
  console.log(`updateObjectsInAlgolia push completed!! TimeTaken: ${timeTaken} Mins`);

  return await updateMeta(meta.id, { algoliaUpdatedAt: Date.now() });
}

export async function deleteObjectsInAlgolia(metaId: number) {
  console.log("deleteObjectsInAlgolia push started!");
  const startTime = Date.now();

  const meta = await findMetaById(metaId);

  if (!meta) {
    return;
  }

  const movieRecords = [...meta.algoliaMovieIds];
  console.log(movieRecords);
  while (movieRecords.length) { await moviesIndex.deleteObjects(movieRecords.splice(0, 10000)); }

  const celebRecords = [...meta.algoliaCelebIds];
  console.log(celebRecords);
  while (celebRecords.length) { await celebsIndex.deleteObjects(celebRecords.splice(0, 10000)); }

  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 60000;
  console.log(`deleteObjectsInAlgolia push completed!! TimeTaken: ${timeTaken} Mins`);

  return await updateMeta(meta.id, { algoliaUpdatedAt: Date.now() });
}
