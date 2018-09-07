import { IUser, UserModel } from "./model";

function generateUserData(user: IUser) {
  return {
    id: user._id,
    authId: user.authId,
    bookmarks: user.bookmarks,
    seen: user.seen
  };
}

export async function findOrCreateUser(authId: string) {
  return await UserModel.findOneOrUpdate({ authId });
}

export async function updateUserBookmarks(userId: number, movieId: number) {
  const user = await UserModel.update(userId, { $push: { bookmarks: movieId } });
  return await generateUserData(user);
}

export async function findUserByAuthId(authId: string) {
  const users = await UserModel.find({ authId });
  console.log(users);

  if (!users || !users[0]) {
    return;
  }

  return generateUserData(users[0]);
}

export async function findUserById(id: number) {
  const user = await UserModel.findById(id);
  return generateUserData(user);
}
