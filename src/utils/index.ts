import {
  defaultTo,
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
    map(pricePre),
    map((usage) => {
      if (usage.usage_type === "dalle") {
        console.log(
          "%c [ usage ]-39",
          "font-size:13px; background:#9749ef; color:#db8dff;",
          usage
        );
      }
      const [promptTokensCostUsdDollar, completionTokensCostUsdDollar] =
        costPerToken(
          usage.model,
          usage.n_context_tokens_total,
          usage.n_generated_tokens_total
        );

      return {
        ...usage,
        price: promptTokensCostUsdDollar + completionTokensCostUsdDollar,
      };
    })
  )(usages);
};

const pricePre = (usage: Usage) => {
  switch (usage.usage_type) {
    case "tts":
      return usage;
    case "dalle":
      let model = usage.model;
      if (usage.model === "dall-e-3") {
        model = `standard/${usage.image_size?.replace("x", "-x-")}/${usage.model}`;
      } else if (usage.model === "dall-e-2") {
        model = `${usage.image_size?.replace("x", "-x-")}/${usage.model}`;
      }

      return {
        ...usage,
        model,
        n_context_tokens_total:
          new Function(
            `return ${usage.image_size?.replace("x", "*") || "0"}`
          )() * defaultTo(usage.num_images, 1),
      };

    default:
      return usage;
  }
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

export const groupedByOfUser = (usages: Usage[]) => {
  const defaultTo0 = defaultTo(0);

  const groupByOfModelAndUserName = (usages: Usage[]) =>
    groupBy((item: Usage) => `${item.model || ""}-${item.user}`)(usages);

  return pipe(
    groupByOfModelAndUserName,
    values,
    map((group: Array<Usage> | undefined) => {
      if (isNil(group)) {
        return undefined;
      }

      return group.reduce(
        (acc, item) => ({
          ...item,
          n_context_tokens_total:
            defaultTo0(acc?.n_context_tokens_total) +
            defaultTo0(item?.n_context_tokens_total),
          n_generated_tokens_total:
            defaultTo0(acc?.n_generated_tokens_total) +
            defaultTo0(item?.n_generated_tokens_total),
          price: defaultTo0(acc.price) + defaultTo0(item.price),
        }),
        {} as unknown as Usage
      );
    })
  )(usages);
};
