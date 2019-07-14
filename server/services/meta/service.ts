import { IMeta, MetaModel } from "./model";

async function generateMetaDatas(metas: IMeta[]) {
  const result: any[] = [];

  if (metas) {
    for (const meta of metas) {
      const resultMeta = await generateMetaData(meta);
      result.push(resultMeta);
    }
  }

  return result;
}

async function generateMetaData(meta: IMeta) {
  if (meta) {
    return {
      id: meta.metaId,
      years: meta.years,
      months: meta.months,
      movieIds: meta.movieIds,
      celebIds: meta.celebIds,
      algoliaMovieIds: meta.algoliaMovieIds,
      algoliaCelebIds: meta.algoliaCelebIds,
      type: meta.type,
      databaseUpdatedAt: meta.databaseUpdatedAt,
      firebaseUpdatedAt: meta.firebaseUpdatedAt,
      algoliaUpdatedAt: meta.algoliaUpdatedAt
    };
  }
}

export async function createMeta(data: any) {
  const meta = await MetaModel.create({ databaseUpdatedAt: Date.now(), firebaseUpdatedAt: null, algoliaUpdatedAt: null, ...data });
  return generateMetaData(meta);
}

export async function updateMeta(metaId: number, update: any) {
  const meta = await MetaModel.findByIdAndUpdate(metaId, update);
  return generateMetaData(meta);
}

export async function updateMetas(query: any, update: any) {
  return await MetaModel.updateMany(query, update);
}

export async function findMetas(): Promise<IMeta[]> {
  const metas = await MetaModel.find([], { databaseUpdatedAt: -1 });
  return generateMetaDatas(metas);
}

export async function findMetaByQuery(query: any) {
  const meta = await MetaModel.findOne(query);
  return generateMetaData(meta);
}

export async function findMetaById(metaId: number): Promise<any> {
  const meta = await MetaModel.findById(metaId);
  return generateMetaData(meta);
}
