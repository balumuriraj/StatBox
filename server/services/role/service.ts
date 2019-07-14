import { IRole, RoleModel } from "./model";

async function generateRoleData(role: IRole) {
  if (role) {
    return {
      id: role.roleId,
      index: role.index,
      celebId: role.celebId,
      movieId: role.movieId,
      category: role.category,
      type: role.type
    };
  }
}

async function generateRolesData(roles: IRole[]) {
  const result: any[] = [];

  if (roles) {
    for (const role of roles) {
      const resultRole = await generateRoleData(role);
      result.push(resultRole);
    }
  }

  return result;
}

export async function createRole(role: any) {
  const result = await RoleModel.create(role);
  return await generateRoleData(result);
}

export async function updateRole(roleId: number, role: any) {
  const result = await RoleModel.findByIdAndUpdate(roleId, role);
  return await generateRoleData(result);
}

export async function deleteRole(roleId: number) {
  return await RoleModel.deleteOne(roleId);
}

export async function deleteRoles(query: any) {
  return await RoleModel.deleteMany(query);
}

export async function findRolesByQuery(query: any) {
  const roles = await RoleModel.find([query]);
  return await generateRolesData(roles);
}

export async function findRolesByMovieIds(movieIds: number[], category?: string, index?: number) {
  const query = { movieId: { $in: movieIds } };

  if (category != null) {
    query["category"] = category;
  }

  if (index != null) {
    query["index"] = index;
  }

  const roles = await RoleModel.find([query]);
  return await generateRolesData(roles);
}

export async function findRolesByCelebIds(celebIds: number[]) {
  const query = { celebId: { $in: celebIds } };
  const roles = await RoleModel.find([query]);
  return await generateRolesData(roles);
}

export async function findRoleById(roleId: number) {
  const role = await RoleModel.findById(roleId);
  return await generateRoleData(role);
}

export async function findRolesByIds(ids: number[]) {
  const query = { roleId: { $in: ids } };
  const roles = await RoleModel.find([query]);
  return await generateRolesData(roles);
}

export async function findRolesByFilterCount(where: {
  category?: string;
  celebIds?: number[];
  movieIds?: number[];
  types?: string[];
}) {
  const query: any = [];

  if (where.category) {
    query.push(
      { $match: { category: where.category } }
    );
  }

  if (where.celebIds && where.celebIds.length) {
    query.push(
      { $match: { celebId: { $in: where.celebIds } } }
    );
  }

  if (where.movieIds && where.movieIds.length) {
    query.push(
      { $match: { movieId: { $in: where.movieIds } } }
    );
  }

  if (where.types && where.types.length) {
    query.push(
      { $match: { type: { $in: where.types } } }
    );
  }

  query.push({
    $count: "count"
  });

  const results = await RoleModel.aggregate(query);
  return results[0].count;
}

export async function findRolesByFilter(
  where: {
    category?: string;
    celebIds?: number[];
    movieIds?: number[];
    types?: string[];
  },
  sortBy: string,
  limit?: number,
  skip?: number
): Promise<any> {
  const query: any = [];

  if (where.category) {
    query.push(
      { $match: { category: where.category } }
    );
  }

  if (where.celebIds && where.celebIds.length) {
    query.push(
      { $match: { celebId: { $in: where.celebIds } } }
    );
  }

  if (where.movieIds && where.movieIds.length) {
    query.push(
      { $match: { movieId: { $in: where.movieIds } } }
    );
  }

  if (where.types && where.types.length) {
    query.push(
      { $match: { type: { $in: where.types } } }
    );
  }

  if (sortBy) {
    const sort: any = {};
    sort[sortBy] = 1; // ascending order
    sort["movieId"] = 1;

    query.push({
      $sort: sort
    });
  } else {
    query.push({
      $sort: { index: 1, celebId: 1, movieId: 1 }
    });
  }

  if (skip) {
    query.push({
      $skip: skip
    });
  }

  if (limit) {
    query.push({
      $limit: limit
    });
  }

  const roles = await RoleModel.aggregate(query);
  return generateRolesData(roles);
}
