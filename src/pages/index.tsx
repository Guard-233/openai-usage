import { Column } from "@ant-design/plots";
import usages from "../../activity-2024-02-01-2024-03-01.json";
import { showUsageByDay } from "@/utils";
import { UsageUpload } from "@/components/usageUpload";
import { useState } from "react";
import { Usage } from "@/types/type";
import { isEmpty } from "ramda";
import { Empty } from "antd";
import i18next from "i18next";

export default function HomePage() {
  const [usageJson, setUsageJson] = useState<Usage[]>([]);

  return (
    <div>
      <UsageUpload onUpload={setUsageJson} />
      {isEmpty(usageJson) ? (
        <Empty
          description={
            <div>
              <div>{i18next.t("请上传 openAI 的 JSON 用量数据")}</div>
              <div
                onClick={() => {
                  window.open("https://platform.openai.com/usage");
                }}
                className="text-blue-300 cursor-pointer"
              >
                {i18next.t("在这里可以拿到")}
              </div>
            </div>
          }
        >
          <UsageUpload onUpload={setUsageJson} />
        </Empty>
      ) : (
        <Column
          xField="timestamp"
          colorField={"model"}
          yField={"num_requests"}
          stack
          data={showUsageByDay(usageJson)}
        ></Column>
      )}
    </div>
  );
}
