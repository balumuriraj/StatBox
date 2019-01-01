import { FirebaseCounterModel, IFirebaseCounter } from "./model";

async function generateFirebaseCounterData(counter: IFirebaseCounter) {
  return {
    id: counter._id,
    moviesCount: counter.moviesCount,
    celebsCount: counter.celebsCount
  };
}

export async function findFirebaseCounterById(id: number) {
  const movie = await FirebaseCounterModel.findById(id);
  return await generateFirebaseCounterData(movie);
}
