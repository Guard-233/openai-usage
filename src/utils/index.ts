import { evolve, lensProp, map, over, pipe } from "ramda";
import { Usage } from "../types/type";

export const fixTimestamp = (usages: Usage[]) =>
  map<Usage, Usage>(
    evolve({
      timestamp: (timestamp) => timestamp * 1000,
    })
  )(usages);

export const showUsageByDay = (usages: Usage[]) => {
  return pipe(
    fixTimestamp,
    map(
      evolve({
        timestamp: (timestamp: number) =>
          new Date(timestamp).toLocaleDateString(),
      })
    )
  )(usages);
};

export const showPriceByDay = (usages: Usage[]) => {
  return pipe(
    fixTimestamp,
    map(
      evolve({
        timestamp: (timestamp: number) =>
          new Date(timestamp).toLocaleDateString(),
      })
    )
  )(usages);
};
