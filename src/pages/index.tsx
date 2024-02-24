import { Bar, Column, Line } from "@ant-design/plots";
import usages from "../../activity-2024-02-01-2024-03-01.json";
import {
  allModels,
  allUsers,
  groupByOfModelAndUserTimestamp,
  groupedByOfUser,
  showUsageByDay,
} from "@/utils";
import { UsageUpload } from "@/components/usageUpload";
import { useMemo, useState } from "react";
import { Usage } from "@/types/type";
import { divide, filter, isEmpty } from "ramda";
import { Empty, Radio, Switch } from "antd";
import i18next from "i18next";
import { costPerToken } from "@/utils/cost";
import { useLocalStorageState } from "ahooks";
import useUrlState from "@ahooksjs/use-url-state";

const YFiled = [
  "price",
  "n_context_tokens_total",
  "n_generated_tokens_total",
  "num_requests",
];

const ColorField = ["model", "user"];

export default function HomePage() {
  const [usageJson, setUsageJson] = useLocalStorageState<Usage[]>("usages", {
    defaultValue: [],
  });

  const [yField, setYField] = useLocalStorageState("yFiled", {
    defaultValue: YFiled[0],
  });

  const [colorField, setColorField] = useLocalStorageState("colorFiled", {
    defaultValue: ColorField[0],
  });

  const users = useMemo(
    () => allUsers(showUsageByDay(usageJson!)),
    [usageJson]
  );

  const [currentUser, setCurrentUser] = useUrlState({ user: users[0] });
  console.log(
    "%c [ currentUser ]-48",
    "font-size:13px; background:#4d11ae; color:#9155f2;",
    currentUser
  );

  const models = useMemo(
    () => allModels(showUsageByDay(usageJson!)),
    [usageJson]
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
          <div>{i18next.t("分组字段")}</div>
          <Radio.Group
            value={yField}
            onChange={(e) => setYField(e.target.value)}
          >
            {YFiled.map((item, index) => {
              return <Radio.Button value={item}>{item}</Radio.Button>;
            })}
          </Radio.Group>
          <div>{i18next.t("用户字段")}</div>
          <Radio.Group
            value={colorField}
            onChange={(e) => setColorField(e.target.value)}
          >
            {ColorField.map((item) => {
              return <Radio.Button value={item}>{item}</Radio.Button>;
            })}
          </Radio.Group>
          <Column
            xField="timestamp"
            colorField={colorField}
            yField={yField}
            stack
            interaction={{
              tooltip: {
                render(
                  _: any,
                  options: {
                    title: string;
                    items: {
                      name?: string;
                      color?: string;
                      value?: any;
                    }[];
                  }
                ) {
                  return (
                    <div>
                      <div>
                        {options.title}{" "}
                        {options.items.reduce((pre, now) => {
                          return pre + now.value;
                        }, 0)}
                      </div>
                      {options.items.map((item) => {
                        return (
                          <div className="flex justify-between">
                            <div>{item.name}:</div>
                            <div className="pl-2">{item.value}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                },
              },
            }}
            data={
              colorField === "user"
                ? groupedByOfUser(
                    showUsageByDay(usageJson!),
                    groupByOfModelAndUserTimestamp
                  )
                : showUsageByDay(usageJson!)
            }
          ></Column>
          <Bar
            xField="user"
            colorField={"model"}
            yField={yField}
            stack
            data={groupedByOfUser(showUsageByDay(usageJson!))}
          ></Bar>
          <div>{i18next.t("单用户用量")}</div>
          <Radio.Group
            value={currentUser.user}
            onChange={(e) =>
              setCurrentUser({
                user: e.target.value,
              })
            }
          >
            {users.map((item) => {
              return <Radio.Button value={item}>{item}</Radio.Button>;
            })}
          </Radio.Group>
          <Column
            xField="timestamp"
            colorField={"model"}
            yField={yField}
            stack
            data={filter((item: Usage) => {
              return item.user === currentUser.user;
            })(showUsageByDay(usageJson!))}
          ></Column>

          <div>单模型用量</div>
          <div className="flex flex-wrap">
            {models.map((model) => {
              return (
                <div className="w-1/3">
                  <div>{model}</div>
                  <Line
                    xField="timestamp"
                    yField={yField}
                    data={filter((item: Usage) => {
                      return item.model === model;
                    })(showUsageByDay(usageJson!))}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
