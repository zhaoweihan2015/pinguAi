import { forwardRef, useImperativeHandle, useState } from "react";
import { ChatRequestOptions } from "ai";
import Image from "next/image";
import { Sender } from "@ant-design/x";
import { Button, Space, Switch, Typography, UploadProps } from "antd";
import { ClearOutlined, InboxOutlined, LinkOutlined } from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";
import { convertToBase64 } from "@/util";
import { useGlobalState } from "@/lib/hooks/useGlobal";
import { UploadFile } from "./Chat";

interface SenderProps {
  input: string;
  setInput: (input: string) => void;
  loading: boolean;
  modal: string;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  onMessageSubmit: (
    nextContent: string,
    isNetwork: boolean,
    uploadFiles: UploadFile[]
  ) => void;
  onMessageClean: () => void;
}

export type SenderRef = {
  reloadMessage: () => void;
};

const SenderComponent = forwardRef<SenderRef, SenderProps>(
  (
    {
      input,
      setInput,
      loading,
      reload,
      modal,
      onMessageSubmit,
      onMessageClean,
    },
    ref
  ) => {
    const { activeKey } = useGlobalState();

    const [headerOpen, setHeaderOpen] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
    const [isNetwork, setIsNetwork] = useState(false);

    const reloadMessage = () => {
      reload({
        body: {
          network: isNetwork ? "1" : "0",
          modal,
          files: uploadFiles,
        },
      });
    };

    useImperativeHandle(ref, () => ({
      reloadMessage,
    }));

    const props: UploadProps = {
      multiple: true,
      fileList: uploadFiles,
      customRequest: async ({ file, onSuccess }) => {
        const uid = new Date().getTime().toString();

        const { base64, mimeType } = await convertToBase64(file as File);

        const name = (file as File).name;

        const newFile = {
          uid,
          name,
          base64,
          mimeType,
        };

        onSuccess?.(newFile);

        setUploadFiles((prev) => [...prev, newFile]);

        return Promise.resolve();
      },
      itemRender: (_, file) => {
        return (
          <Image
            src={(file as UploadFile).base64}
            alt={file.name}
            width={60}
            height={60}
            className="upload-file-image"
          />
        );
      },
    };

    const onSubmit = (nextContent: string) => {
      if (!nextContent) return;

      // 向ai提交
      onMessageSubmit(nextContent, isNetwork, uploadFiles);
      // 清空上传文件
      setUploadFiles([]);
      // 关闭上拉框
      setHeaderOpen(false);
    };

    const clean = () => {
      if (!activeKey) return;

      onMessageClean();
      setUploadFiles([]);
      setHeaderOpen(false);
    };

    return (
      <Sender
        value={input}
        onSubmit={onSubmit}
        onChange={setInput}
        loading={loading}
        className="sender"
        prefix={
          modal === "doubao-1.5-vision-pro-32k" ? (
            <Button
              type="text"
              icon={<LinkOutlined />}
              onClick={() => {
                setHeaderOpen(!headerOpen);
              }}
            />
          ) : null
        }
        header={
          <>
            <Sender.Header open={headerOpen} onOpenChange={setHeaderOpen}>
              <Dragger {...props}>
                <div className="upload-drag-icon-container">
                  {uploadFiles.length === 0 ? (
                    <>
                      <p className="upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="upload-text">点击或拖拽文件上传</p>
                    </>
                  ) : null}
                </div>
              </Dragger>
            </Sender.Header>
            <div className="sender-header">
              <Switch
                disabled={modal === "doubao"}
                checked={isNetwork}
                checkedChildren={"联网"}
                unCheckedChildren={"断网"}
                onChange={setIsNetwork}
              />
            </div>
          </>
        }
        actions={(_, info) => {
          const { SendButton, LoadingButton } = info.components;

          return (
            <Space size="small">
              <Typography.Text type="secondary">
                <small>清除对话</small>
              </Typography.Text>
              <Button type="text" icon={<ClearOutlined />} onClick={clean} />
              {loading ? (
                <LoadingButton type="default" onClick={stop} disabled={false} />
              ) : (
                <SendButton type="primary" disabled={false} />
              )}
            </Space>
          );
        }}
      />
    );
  }
);

SenderComponent.displayName = "SenderComponent";

export default SenderComponent;
