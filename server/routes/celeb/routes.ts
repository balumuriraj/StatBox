import * as dateFormat from "dateformat";
import { findCelebsByIds } from "../../services/celeb/service";

async function getCelebsByIds(params: any) {
  const { celebIds } = params;
  const keys = params[2] || ["id", "name", "photo", "dob"];
  const results: any[] = [];

  const celebs = await findCelebsByIds(celebIds);

  celebs.forEach((celeb) => {
    for (const key of keys) {
      let value = celeb[key];

      if (key === "dob") {
        const dateStr = celeb[key];
        const date = new Date(dateStr);
        value = dateFormat(date, "mediumDate");
      }

      results.push({
        path: ["celebsById", celeb.id, key],
        value: value || null
      });
    }
  });

  return results;
}

export default [
  {
    route: "celebsById[{integers:celebIds}]",
    get: getCelebsByIds
  }
];
