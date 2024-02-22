import { Column } from "@ant-design/plots";
import usages from "../../activity-2024-02-01-2024-03-01.json";
import { groupedByModel, showUsageByDay } from "@/utils";
import { UsageUpload } from "@/components/usageUpload";
import { useState } from "react";
import { Usage } from "@/types/type";
import { isEmpty } from "ramda";
import { Empty } from "antd";
import i18next from "i18next";
import { costPerToken } from "@/utils/cost";
import { useLocalStorageState } from "ahooks";

export default function HomePage() {
  const [usageJson, setUsageJson] = useLocalStorageState<Usage[]>("usages", {
    defaultValue: [],
  });

  const price = costPerToken("gpt-3.5-turbo-0125", 1515, 892);

  console.log(
    "%c [ price ]-16",
    "font-size:13px; background:#068e22; color:#4ad266;",
    price
  );
  console.log(
    "%c [ groupedByModel(showUsageByDay(usageJson!)) ]-26",
    "font-size:13px; background:#aad9a8; color:#eeffec;",
    groupedByModel(showUsageByDay(usageJson!))
  );

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
        <div>
          <Column
            xField="timestamp"
            colorField={"model"}
            yField={"price"}
            stack
            data={showUsageByDay(usageJson!)}
          ></Column>
          <Column
            xField="user"
            colorField={"model"}
            yField={"price"}
            stack
            data={groupedByModel(showUsageByDay(usageJson!))}
          ></Column>
        </div>
      )}
    </div>
  );
}
