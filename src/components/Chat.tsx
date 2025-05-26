"use client";

import { Bubble } from "@ant-design/x";
import React, { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { CopyOutlined, SyncOutlined, UserOutlined } from "@ant-design/icons";
import { Button, type GetProp, Space } from "antd";
import { useChat } from "@ai-sdk/react";
import ChatMarkDown from "./ChatMarkDown";
import { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";
import PlaceHolderNode from "./PlaceHolderNode";
import ConfigModal from "./ConfigModal";
import Menu, { MenuRef } from "./Menu";
import { useGlobalState } from "@/lib/hooks/useGlobal";
import SenderComponent, { SenderRef } from "./Sender";

export interface UploadFile {
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

  const senderRef = useRef<SenderRef>(null);

  const loading = useMemo(
    () => status === "submitted" || status === "streaming",
    [status]
  );

  const [modal, setModal] = React.useState("deepseek-r1");

  const menuRef = useRef<MenuRef>(null);

  const [showMemoryUpdate, setShowMemoryUpdate] = React.useState(false);

  // ==================== Event ====================
  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      menuRef.current?.handleConversation(messages, !activeKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (chatRef.current) {
      const div = chatRef.current.querySelector(".ant-bubble-list");
      div?.scrollTo(0, 9999999);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(messages)]);

  const copy = (message: string) => {
    navigator.clipboard.writeText(message);
  };

  // 向ai提交
  const onSubmit = (
    nextContent: string,
    isNetwork: boolean,
    uploadFiles: UploadFile[]
  ) => {
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
          files: uploadFiles,
        },
      }
    );
    // 清空输入框
    setInput("");
  };

  // 清空对话
  const onClean = () => {
    menuRef.current?.handleConversation([]);
    stop();
    setMessages([]);
    setInput("");
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
                onClick={() => senderRef.current?.reloadMessage()}
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
        <SenderComponent
          ref={senderRef}
          loading={loading}
          input={input}
          setInput={setInput}
          reload={reload}
          modal={modal}
          onMessageSubmit={onSubmit}
          onMessageClean={onClean}
        />
      </div>
    </div>
  );
};

export default Independent;
