import { CelebModel } from "../services/celeb/model";
import { findCelebsByIds } from "../services/celeb/service";
import { findMetaById, updateMeta } from "../services/meta/service";
import { MovieModel } from "../services/movie/model";
import { findMoviesByIds } from "../services/movie/service";
import { deleteImage, uploadImage } from "../support/firebaseUtils";

export async function addImages(metaId: number) {
  console.log("firebase storage push started!");
  const startTime = Date.now();

  const meta = await findMetaById(metaId);

  if (!meta) {
    return;
  }

  const movieRecords = await findMoviesByIds(meta.movieIds);
  const celebRecords = await findCelebsByIds(meta.celebIds);

  for (const movie of movieRecords) {
    if (movie.poster) {
      const url = await uploadImage(movie.poster, `images/posters/${movie.id}.jpg`);
      await MovieModel.update(movie.id, { $set: { poster: url } });
    }
  }

  for (const record of celebRecords) {
    if (record.photo) {
      const url = await uploadImage(record.photo, `images/photos/${record.id}.jpg`);
      await CelebModel.update(record.id, { $set: { photo: url } });
    }
  }

  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 60000;
  console.log(`firebase storage push completed!! TimeTaken: ${timeTaken} Mins`);

  return await updateMeta(meta.id, { firebaseUpdatedAt: Date.now() });
}

export async function deleteImages(metaId: number) {
  console.log("firebase storage delete started!");
  const startTime = Date.now();

  const meta = await findMetaById(metaId);

  if (!meta) {
    return;
  }

  for (const movieId of meta.movieIds) {
    if (movieId) {
      await deleteImage(`images/posters/${movieId}.jpg`);
    }
  }

  for (const celebId of meta.celebIds) {
    if (celebId) {
      await deleteImage(`images/photos/${celebId}.jpg`);
    }
  }

  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 60000;
  console.log(`firebase storage delete completed!! TimeTaken: ${timeTaken} Mins`);

  return await updateMeta(meta.id, { firebaseUpdatedAt: Date.now() });
}
