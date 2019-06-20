import { IUser, UserModel } from "./model";

async function generateUsersData(users: IUser[]) {
  const result: any[] = [];

  for (const user of users) {
    const resultUser = await generateUserData(user);
    result.push(resultUser);
  }

  return result;
}

function generateUserData(user: IUser) {
  return {
    id: user._id,
    authId: user.authId,
    bookmarks: user.bookmarks,
    favorites: user.favorites
  };
}

export async function removeUser(userId: number) {
  return await UserModel.deleteOne({ _id: userId });
}

export async function findOrCreateUser(authId: string) {
  return await UserModel.findOneOrUpdate({ authId });
}

export async function addUserBookmark(userId: number, movieId: number) {
  const user = await UserModel.update(userId, { $push: { bookmarks: movieId } });
  return await generateUserData(user);
}

export async function removeUserBookmark(userId: number, movieId: number) {
  const user = await UserModel.update(userId, { $pull: { bookmarks: movieId } });
  return await generateUserData(user);
}

export async function addUserFavorite(userId: number, movieId: number) {
  const user = await UserModel.update(userId, { $push: { favorites: movieId } });
  return await generateUserData(user);
}

export async function removeUserFavorite(userId: number, movieId: number) {
  const user = await UserModel.update(userId, { $pull: { favorites: movieId } });
  return await generateUserData(user);
}

export async function findUserByAuthId(authId: string) {
  const users = await UserModel.find({ authId });

  if (!users || !users[0]) {
    return;
  }

  return generateUserData(users[0]);
}

export async function findUserById(id: number) {
  const user = await UserModel.findById(id);
  return generateUserData(user);
}

export async function findUsersByIds(ids: number[]) {
  const query = { _id: { $in: ids } };
  const users = await UserModel.find(query);
  return generateUsersData(users);
}
