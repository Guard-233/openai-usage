import { not, isNil } from "ramda";
import modelCost from "./pricing.json";

type modeName = keyof typeof modelCost | (string & {});

function modelPricingByTokens(
  modelCostRef: Record<modeName, any>,
  model: modeName
) {
  return (
    not(isNil(modelCostRef[model].input_cost_per_token)) &&
    not(isNil(modelCostRef[model].output_cost_per_token))
  );
}

function modelPricingByPixel(
  modelCostRef: Record<modeName, any>,
  model: modeName
) {
  return (
    not(isNil(modelCostRef[model].input_cost_per_pixel)) &&
    not(isNil(modelCostRef[model].output_cost_per_pixel))
  );
}

function modelPricingBySecond(
  modelCostRef: Record<modeName, any>,
  model: modeName,
  responseTimeMs: number | null
): responseTimeMs is number {
  return (
    not(isNil(modelCostRef[model].input_cost_per_second)) &&
    not(isNil(responseTimeMs))
  );
}

export function costPerToken(
  model?: modeName,
  promptTokens = 0,
  completionTokens = 0,
  responseTimeMs = null,
  customLlmProvider = null,
  regionName = null
) {
  if (isNil(model)) {
    return [0, 0];
  }

  let promptTokensCostUsdDollar = 0;
  let completionTokensCostUsdDollar = 0;
  let modelCostRef: Record<modeName, any> = modelCost;
  let modelWithProvider: string = model;
  if (customLlmProvider !== null) {
    modelWithProvider = customLlmProvider + "/" + model;
    if (regionName !== null) {
      let modelWithProviderAndRegion = `${customLlmProvider}/${regionName}/${model}`;
      if (modelWithProviderAndRegion in modelCostRef) {
        modelWithProvider = modelWithProviderAndRegion;
      }
    }
  }
  if (modelWithProvider in modelCostRef) {
    model = modelWithProvider;
  }

  if (not(model in modelCostRef)) {
    let errorStr = `Model not in model_prices_and_context_window.json. You passed model=${model}. Register pricing for model - https://docs.litellm.ai/docs/proxy/custom_pricing\n`;
    // throw new Error(errorStr);
    return [0, 0];
  }

  if (modelPricingByTokens(modelCostRef, model)) {
    promptTokensCostUsdDollar =
      modelCostRef[model].input_cost_per_token * promptTokens;

    completionTokensCostUsdDollar =
      modelCostRef[model].output_cost_per_token * completionTokens;
  } else if (modelPricingByPixel(modelCostRef, model)) {
    promptTokensCostUsdDollar =
      modelCostRef[model].input_cost_per_pixel * promptTokens;

    completionTokensCostUsdDollar =
      modelCostRef[model].output_cost_per_pixel * completionTokens;
  } else if (modelPricingBySecond(modelCostRef, model, responseTimeMs)) {
    promptTokensCostUsdDollar =
      (modelCostRef[model].input_cost_per_second * responseTimeMs) / 1000;
    completionTokensCostUsdDollar = 0.0;
  }

  return [promptTokensCostUsdDollar, completionTokensCostUsdDollar];
}
