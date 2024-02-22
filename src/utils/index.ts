import {
  evolve,
  groupBy,
  isNil,
  isNotNil,
  lensProp,
  map,
  not,
  over,
  pipe,
  prop,
  reduce,
  values,
} from "ramda";
import { Usage } from "../types/type";
import { costPerToken } from "./cost";

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
    ),
    map((e) => {
      return {
        ...e,
        price:
          isNotNil(e.model) &&
          isNotNil(e.n_context_tokens_total) &&
          isNotNil(e.n_generated_tokens_total)
            ? costPerToken(
                e.model,
                e.n_context_tokens_total,
                e.n_generated_tokens_total
              )[0] +
              costPerToken(
                e.model,
                e.n_context_tokens_total,
                e.n_generated_tokens_total
              )[1]
            : 0,
      };
    })
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

export const groupedByModel = (usages: Usage[]) => {
  return values(
    map((group: any[]) => {
      return group.reduce(
        (acc: any, item: any) => ({
          ...item,
          organization_name: item.organization_name,
          n_context_tokens_total:
            acc.n_context_tokens_total + item.n_context_tokens_total,
          n_generated_tokens_total:
            acc.n_generated_tokens_total + item.n_generated_tokens_total,
          price:
            (isNaN(acc.price) ? 0 : acc.price) +
            (isNaN(item.price) ? 0 : item.price),
          model: item.model,
        }),
        {
          organization_name: "",
          n_context_tokens_total: 0,
          n_generated_tokens_total: 0,
          model: "",
        }
      );
    })(groupBy((item) => `${item.model}-${item.user}`, usages))
  );
};
