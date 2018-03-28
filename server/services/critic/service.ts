import { CriticModel, ICritic } from "./model";

async function generateCriticData(critic: ICritic) {
  return {
    id: critic._id,
    name: critic.name,
    image: critic.image,
    reviewIds: critic.reviewIds
  };
}

export async function findCriticById(id: number) {
  const movie = await CriticModel.findById(id);
  return await generateCriticData(movie);
}
