"use client";

import { Bubble, Sender } from "@ant-design/x";
import React, { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  ClearOutlined,
  CopyOutlined,
  InboxOutlined,
  LinkOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  type GetProp,
  Space,
  Typography,
  Switch,
  UploadProps,
} from "antd";
import { useChat } from "@ai-sdk/react";
import ChatMarkDown from "./ChatMarkDown";
import { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";
import { UIMessage } from "ai";
import PlaceHolderNode from "./PlaceHolderNode";
import ConfigModal from "./ConfigModal";
import Menu, { MenuRef } from "./Menu";
import { useGlobalState } from "@/lib/hooks/useGlobal";
import Dragger from "antd/es/upload/Dragger";
import { convertToBase64 } from "@/util";

interface UploadFile {
  uid: string;
  name: string;
  base64: string;
  mimeType: string;
}

const roles: GetProp<typeof Bubble.List, "roles"> = {
  ai: {
    placement: "start",
    avatar: {
      icon: <Image src="/pingu.png" alt="pingu" width={32} height={32} />,
      style: { background: "#fde3cf" },
    },
    style: {
      maxWidth: "90%",
    },
  },
  user: {
    placement: "end",
    avatar: { icon: <UserOutlined />, style: { background: "#87d068" } },
  },
};

const Independent: React.FC = () => {
  // ==================== Runtime ====================
  const {
    messages,
    input,
    reload,
    setMessages,
    setInput,
    append,
    status,
    stop,
  } = useChat({
    experimental_throttle: 100,
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === "setMemory") {
        if (timer.current) clearTimeout(timer.current);

        setShowMemoryUpdate(true);

        timer.current = setTimeout(() => {
          setShowMemoryUpdate(false);
        }, 5000);
      }
    },
  });
  // ==================== State ====================
  const timer = useRef<NodeJS.Timeout | null>(null);

  const { activeKey } = useGlobalState();

  const [open, setOpen] = React.useState(false);

  const [headerOpen, setHeaderOpen] = React.useState(false);

  const loading = useMemo(
    () => status === "submitted" || status === "streaming",
    [status]
  );

  const [isNetwork, setIsNetwork] = React.useState(false);

  const [modal, setModal] = React.useState("deepseek-r1");

  const menuRef = useRef<MenuRef>(null);

  const [showMemoryUpdate, setShowMemoryUpdate] = React.useState(false);

  const [uploadFiles, setUploadFiles] = React.useState<UploadFile[]>([]);

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
      }

      onSuccess?.(newFile);

      setUploadFiles((prev) => [...prev, newFile]);

      return Promise.resolve();
    },
    itemRender: (_, file) => {
      return (
        <Image src={(file as UploadFile).base64} alt={file.name} width={60} height={60} className="upload-file-image" />
      );
    },
  };
  // ==================== Event ====================
  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      menuRef.current?.handleConversation(messages, !activeKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onSubmit = (nextContent: string) => {
    if (!nextContent) return;
    // 向ai提交
    append(
      {
        role: "user",
        id: `user-${new Date().getTime().toString()}`,
        content: nextContent,
      },
      {
        body: {
          network: isNetwork ? "1" : "0",
          modal,
          files: uploadFiles
        }
      }
    );
    // 清空输入框
    setInput("");
    // 清空上传文件
    setUploadFiles([]);
    // 关闭上拉框
    setHeaderOpen(false);
  };

  useEffect(() => {
    if (chatRef.current) {
      const div = chatRef.current.querySelector(".ant-bubble-list");
      div?.scrollTo(0, 9999999);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(messages)]);

  const clean = () => {
    if (!activeKey) return;

    menuRef.current?.handleConversation([]);
    stop();
    setMessages([]);
    setInput("");
    setUploadFiles([]);
    setHeaderOpen(false);
  };

  const copy = (message: string) => {
    navigator.clipboard.writeText(message);
  };

  const reloadMessage = () => {
    reload({
      body: {
        network: isNetwork ? "1" : "0",
        modal,
        files: uploadFiles
      }
    });
  };

  // ==================== Nodes ====================
  const chatRef = useRef<HTMLDivElement>(null);

  const items: GetProp<typeof Bubble.List, "items"> = useMemo(() => {
    return messages.map((message, index) => {
      if (message.role === "user") {
        return {
          key: message.id,
          role: "user",
          content: message.content,
          messageRender: (content) => {
            return (
              <>
              {
                // message.parts.map((part) => {
                //   return (
                //     <ChatMarkDown key={`usertext-${message.id}`}>
                //       {part}
                //     </ChatMarkDown>
                //   )
                // })
              }
              <ChatMarkDown key={`usertext-${message.id}`}>
                {content}
              </ChatMarkDown>
              </>
            );
          },
        };
      } else if (message.role === "assistant") {
        const set: BubbleDataType = {
          key: message.id,
          role: "ai",
          content: message.content,
          className: "bubble-response",
          messageRender: (content?: string) => {
            return (
              <div>
                {index === messages.length - 1 && (
                  <div
                    className={`memory-update ${
                      showMemoryUpdate ? "show" : ""
                    }`}
                  >
                    记忆已更新...
                  </div>
                )}
                {message.reasoning && (
                  <div className="reasoning">
                    <ChatMarkDown key={`reasoning-${message.id}`}>
                      {message.reasoning}
                    </ChatMarkDown>
                  </div>
                )}
                <ChatMarkDown key={`content-${message.id}`}>
                  {content}
                </ChatMarkDown>
              </div>
            );
          },
        };

        if (index === messages.length - 1) {
          set.footer = (
            <Space>
              <Button
                color="default"
                variant="text"
                size="small"
                icon={<SyncOutlined />}
                onClick={() => reloadMessage(message)}
              />
              <Button
                color="default"
                variant="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copy(message.content)}
              />
            </Space>
          );
        }
        return set;
      } else {
        return {};
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(messages)]);

  // ==================== Render =================
  return (
    <div className="layout">
      <ConfigModal
        open={open}
        onCancel={() => setOpen(false)}
        modal={modal}
        setModal={setModal}
      />
      <Menu
        ref={menuRef}
        setOpen={setOpen}
        setMessages={setMessages}
        setInput={setInput}
      />
      <div className="chat" ref={chatRef}>
        {/* 🌟 消息列表 */}
        {messages.length > 0 ? (
          <Bubble.List
            items={
              items.length > 0
                ? items
                : [{ content: <PlaceHolderNode />, variant: "borderless" }]
            }
            roles={roles}
            className="messages"
          />
        ) : (
          <div className="messages">
            <PlaceHolderNode />
          </div>
        )}
        {/* 🌟 输入框 */}
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
              <Sender.Header
                open={headerOpen}
                onOpenChange={setHeaderOpen}
              >
                <Dragger {...props}>
                  <div className="upload-drag-icon-container">
                    {
                      uploadFiles.length === 0 ? (
                        <>
                          <p className="upload-drag-icon">
                            <InboxOutlined />
                          </p>
                          <p className="upload-text">点击或拖拽文件上传</p>
                        </>
                      ) : null
                    }
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
                  <LoadingButton
                    type="default"
                    onClick={stop}
                    disabled={false}
                  />
                ) : (
                  <SendButton type="primary" disabled={false} />
                )}
              </Space>
            );
          }}
        />
      </div>
    </div>
  );
};

export default Independent;
