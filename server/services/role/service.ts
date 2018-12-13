import { IRole, RoleModel } from "./model";

async function generateRoleData(role: IRole) {
  return {
    id: role._id,
    index: role.index,
    celebId: role.celebId,
    movieId: role.movieId,
    category: role.category,
    type: role.type
  };
}

async function generateRolesData(roles: IRole[]) {
  const result: any[] = [];

  for (const role of roles) {
    const resultRole = await generateRoleData(role);
    result.push(resultRole);
  }

  return result;
}

export async function findRolesByMovieIds(movieIds: number[], category: string, index?: number) {
  const query = { movieId: { $in: movieIds }, category };

  if (index != null) {
    query["index"] = index;
  }

  const roles = await RoleModel.find(query);
  return await generateRolesData(roles);
}

export async function findRolesByCelebIds(celebIds: number[]) {
  const query = { celebId: { $in: celebIds } };
  const roles = await RoleModel.find(query);
  return await generateRolesData(roles);
}

export async function findRolesByIds(ids: number[]) {
  const query = { _id: { $in: ids } };
  const roles = await RoleModel.find(query);
  return await generateRolesData(roles);
}
