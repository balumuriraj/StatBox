import { IUser, UserModel } from "./model";

async function generateUserData(User: IUser) {
  return {
    id: User._id,
    authId: User.authId,
    bookmarks: User.bookmarks
  };
}

export async function createUser(user: IUser) {
  return await UserModel.create(user);
}

export async function updateUserBookmarks(userId: number, movieId: number) {
  const user = await UserModel.update(userId, { $push: { bookmarks: movieId } });
  return await generateUserData(user);
}

export async function findUserByAuthId(authId: string) {
  const users = await UserModel.find({ authId });
  return await generateUserData(users[0]);
}

export async function findUserById(id: number) {
  const user = await UserModel.findById(id);
  return await generateUserData(user);
}
