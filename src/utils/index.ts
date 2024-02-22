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
        price: Number(
          (promptTokensCostUsdDollar + completionTokensCostUsdDollar).toFixed(4)
        ),
      };
    })
  )(usages);
};

const pricePre = (usage: Usage) => {
  switch (usage.usage_type) {
    case "tts":
      return usage;
    case "dalle":
      return {
        ...usage,
        model: dalleModelName(usage),
        n_context_tokens_total:
          imageTokens(usage) * defaultTo(usage.num_images, 1),
      };

    default:
      return usage;
  }
};

const dalleModelName = (usage: Usage) => {
  if (usage.usage_type === "dalle") {
    if (usage.model === "dall-e-3") {
      return `standard/${imageSizeReplace(usage.image_size)}/${usage.model}`;
    } else if (usage.model === "dall-e-2") {
      return `${imageSizeReplace(usage.image_size)}/${usage.model}`;
    }
  }

  return usage;
};

const imageSizeReplace = (imageSize?: string) => {
  return imageSize?.replace("x", "-x-");
};

const imageTokens = (usage: Usage) => {
  switch (usage.image_size) {
    case "256x256":
      return 256 * 256;
    case "512x512":
      return 512 * 512;
    case "1024x1024":
      return 1024 * 1024;
    case "1024x1792":
    case "1792x1024":
      return 1024 * 1792;
    default:
      return 0;
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
          price: Number(
            (defaultTo0(acc.price) + defaultTo0(item.price)).toFixed(4)
          ),
        }),
        {} as unknown as Usage
      );
    })
  )(usages);
};
