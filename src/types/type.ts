export type Usage = {
  /**
   * 组织ID
   */
  organization_id?: string;
  organization_name: string;
  image_size?: string;
  num_images?: number;
  /**
   * 请求次数
   */
  n_requests?: number;
  /**
   * 请求类型
   */
  operation?: string;
  /**
   * 请求token数
   */
  n_context_tokens_total?: number;
  /**
   * 生成token数
   */
  n_generated_tokens_total?: number;
  api_key?: string | null;
  /**
   * 模型类型
   */
  usage_type: string;
  /**
   * 模型名称
   */
  model?: string;
  /**
   * 请求时间
   */
  timestamp: number;
  /**
   * 用户ID
   */
  user: string;
  price?: number;
};

export type Pricing =
  | {
      usage_type: "tts";
      price: number;
      model: string;
    }
  | {
      usage_type: "dalle";
      resolution: string;
      model: string;
      price: number;
      quality: string;
    }
  | {
      usage_type: "text";
      model: string;
      training: number;
      input: number;
      output: number;
    };
