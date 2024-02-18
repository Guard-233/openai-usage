import { Usage } from "@/types/type";
import { UploadOutlined } from "@ant-design/icons";
import { Upload, Button, message } from "antd";
import i18next from "i18next";
import { observer } from "mobx-react";
import { FC } from "react";

export const UsageUpload: FC<{
  onUpload: (usageJson: Usage[]) => void;
}> = observer(({ onUpload }) => {
  const jsonParse = (jsonString: string) => {
    try {
      onUpload(JSON.parse(jsonString).data);
    } catch (err) {
      message.error(i18next.t("上传的文件不是有效的json文件"));
    }
  };

  const fileReaderOnload = (e: ProgressEvent<FileReader>) => {
    if (e.target?.result && typeof e.target.result === "string") {
      jsonParse(e.target?.result);
    } else {
      message.error(i18next.t("上传的文件不是有效的json文件"));
    }
  };

  const fileReaderOnError = () => {
    message.error(i18next.t("上传用量文件失败"));
  };

  return (
    <div>
      <Upload
        beforeUpload={(file) => {
          const fileReader = new FileReader();
          fileReader.onload = fileReaderOnload;
          fileReader.onerror = fileReaderOnError;
          fileReader.readAsBinaryString(file);
          return false;
        }}
        onChange={(info) => {
          const {
            file: { originFileObj },
          } = info;
        }}
        accept="json"
      >
        <Button icon={<UploadOutlined />}>
          {i18next.t("JSON用量文件上传")}
        </Button>
      </Upload>
    </div>
  );
});
