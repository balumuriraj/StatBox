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

export async function findRolesCountByMovieId(movieId: number, category: string) {
  const where: any = { movieId, category };
  const group: any = {
    _id: { movieId: "$movieId" },
    count: { $sum: 1 }
  };

  const query = [
    { $match: where },
    { $group: group }
  ];

  const results = await RoleModel.aggregate(query);
  return results;
}

export async function findRolesByMovieId(movieId: number, category: string) {
  const roles = await RoleModel.find({ movieId, category });
  return await generateRolesData(roles);
}

export async function findRoleById(id: number) {
  const role = await RoleModel.findById(id);
  return await generateRoleData(role);
}
