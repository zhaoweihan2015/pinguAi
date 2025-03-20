"use client";

import { Bubble, Sender } from "@ant-design/x";
import React, { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  ClearOutlined,
  CopyOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, type GetProp, Space, Typography, Switch } from "antd";
import { useChat } from "@ai-sdk/react";
import ChatMarkDown from "./ChatMarkDown";
import { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";
import { UIMessage } from "ai";
import PlaceHolderNode from "./PlaceHolderNode";
import ConfigModal from "./ConfigModal";
import Menu, { MenuRef } from "./Menu";
import { useGlobalState } from "@/lib/hooks/useGlobal";

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
  });
  // ==================== State ====================
  const { activeKey } = useGlobalState();

  const [open, setOpen] = React.useState(false);

  const loading = useMemo(
    () => status === "submitted" || status === "streaming",
    [status]
  );

  const [isNetwork, setIsNetwork] = React.useState(false);

  const [modal, setModal] = React.useState("deepseek");

  const menuRef = useRef<MenuRef>(null);
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
        },
      }
    );
    // 清空输入框
    setInput("");
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
  };

  const copy = (message: string) => {
    navigator.clipboard.writeText(message);
  };

  const reloadMessage = (message: UIMessage) => {
    reload(message);
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
              <ChatMarkDown key={`usertext-${message.id}`}>
                {content}
              </ChatMarkDown>
            );
          },
        };
      } else if (message.role === "assistant") {
        const set: BubbleDataType = {
          key: message.id,
          role: "ai",
          content: message.content,
          messageRender: (content?: string) => {
            return (
              <div>
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
        <Bubble.List
          items={
            items.length > 0
              ? items
              : [{ content: <PlaceHolderNode />, variant: "borderless" }]
          }
          roles={roles}
          className="messages"
        />
        {/* 🌟 输入框 */}
        <Sender
          value={input}
          onSubmit={onSubmit}
          onChange={setInput}
          loading={loading}
          className="sender"
          header={
            <div className="sender-header">
              <Switch
                disabled={modal === "doubao"}
                checked={isNetwork}
                checkedChildren={"联网"}
                unCheckedChildren={"断网"}
                onChange={setIsNetwork}
              />
            </div>
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
