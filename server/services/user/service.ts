import { IUser, UserModel } from "./model";

async function generateUsersData(users: IUser[]) {
  const result: any[] = [];

  if (users) {
    for (const user of users) {
      const resultUser = await generateUserData(user);
      result.push(resultUser);
    }
  }

  return result;
}

function generateUserData(user: IUser) {
  if (user) {
    return {
      id: user.userId,
      authId: user.authId,
      bookmarks: user.bookmarks,
      favorites: user.favorites
    };
  }
}

export async function findUsersCount() {
  return UserModel.count();
}

export async function removeUser(userId: number) {
  return await UserModel.deleteOne({ userId });
}

export async function updateUsers(query: any, update: any) {
  return await UserModel.updateMany(query, update);
}

export async function findOrCreateUser(authId: string) {
  const user = await UserModel.findOneOrCreate({ authId });
  return await generateUserData(user);
}

export async function addUserBookmark(userId: number, movieId: number) {
  const user = await UserModel.findOneAndUpdate(userId, { $addToSet: { bookmarks: movieId } });
  return await generateUserData(user);
}

export async function removeUserBookmark(userId: number, movieId: number) {
  const user = await UserModel.findOneAndUpdate(userId, { $pull: { bookmarks: movieId } });
  return await generateUserData(user);
}

export async function addUserFavorite(userId: number, movieId: number) {
  const user = await UserModel.findOneAndUpdate(userId, { $addToSet: { favorites: movieId } });
  return await generateUserData(user);
}

export async function removeUserFavorite(userId: number, movieId: number) {
  const user = await UserModel.findOneAndUpdate(userId, { $pull: { favorites: movieId } });
  return await generateUserData(user);
}

export async function findUserByAuthId(authId: string) {
  const users = await UserModel.find([{ authId }]);

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
  const query = { userId: { $in: ids } };
  const users = await UserModel.find([query]);
  return generateUsersData(users);
}
