"use client";

import { Bubble, Conversations, Sender } from "@ant-design/x";
import React, { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  CopyOutlined,
  PlusOutlined,
  SmileFilled,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, type GetProp, Space, Typography } from "antd";
import { useChat } from "@ai-sdk/react";
import ChatMarkDown from "./ChatMarkDown";
import { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";
import { UIMessage } from "ai";
import PlaceHolderNode from "./PlaceHolderNode";
import ConfigModal from "./ConfigModal";

interface ConversationType {
  key: string;
  name: string;
  messages: string;
  createTime?: string;
  updateTime?: string;
}

const roles: GetProp<typeof Bubble.List, "roles"> = {
  ai: {
    placement: "start",
    avatar: {
      icon: <Image src="/pingu.png" alt="pingu" width={32} height={32} />,
      style: { background: "#fde3cf" },
    },
    typing: { step: 5, interval: 20 },
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
  } = useChat();
  // ==================== State ====================
  const [conversationsItems, setConversationsItems] = React.useState<
    GetProp<typeof Conversations, "items">
  >([]);

  const [activeKey, setActiveKey] =
    React.useState<GetProp<typeof Conversations, "activeKey">>("");

  const [open, setOpen] = React.useState(false);

  const loading = useMemo(
    () => status === "submitted" || status === "streaming",
    [status]
  );
  // ==================== Event ====================
  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      handleConversation(messages, !activeKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onSubmit = (nextContent: string) => {
    if (!nextContent) return;
    // 向ai提交
    append({
      role: "user",
      id: `user-${new Date().getTime().toString()}`,
      content: nextContent,
    });
    // 清空输入框
    setInput("");
  };

  const getConversation = async () => {
    const res = await fetch("/api/conversation");
    const data: Record<string, ConversationType> = await res.json();
    setConversationsItems(
      Object.values(data).map((item: ConversationType) => ({
        key: item.key,
        label: item.name,
        messages: item.messages,
      }))
    );
  };

  const handleConversation = async (
    messages: UIMessage[] = [],
    create = false
  ) => {
    const id = create ? new Date().getTime().toString() : activeKey;

    const name = messages[0].content.slice(0, 10);

    try {
      await fetch("/api/conversation", {
        method: "POST",
        body: JSON.stringify({
          key: id,
          name,
          messages: JSON.stringify(messages),
        }),
      });

      if (create) {
        setConversationsItems([
          ...conversationsItems,
          {
            key: id,
            label: name,
          },
        ]);
      }

      setActiveKey(id);

      getConversation();
    } catch (error) {
      console.error(error);
    }
  };

  const onConversationClick: GetProp<typeof Conversations, "onActiveChange"> = (
    key
  ) => {
    setActiveKey(key);

    setMessages(
      JSON.parse(
        conversationsItems.find((item) => item.key === key)?.messages ?? "[]"
      )
    );
  };

  useEffect(() => {
    if (chatRef.current) {
      const div = chatRef.current.querySelector(".ant-bubble-list");
      div?.scrollTo(0, 9999999);
    }
  }, [messages]);

  useEffect(() => {
    getConversation();
  }, []);

  const clean = () => {
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
            return <ChatMarkDown>{content}</ChatMarkDown>;
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
                <div className="reasoning">
                  <ChatMarkDown>{message.reasoning}</ChatMarkDown>
                </div>
                <ChatMarkDown>{content}</ChatMarkDown>
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
  }, [messages]);

  // ==================== Render =================
  return (
    <div className="layout">
      <ConfigModal open={open} onCancel={() => setOpen(false)} />
      <div className="menu">
        {/* 🌟 添加会话 */}
        <Button
          onClick={() => handleConversation([], true)}
          type="primary"
          className="addBtn"
          icon={<PlusOutlined />}
        >
          New Conversation
        </Button>
        {/* 🌟 会话管理 */}
        <Conversations
          items={conversationsItems}
          className="conversations"
          activeKey={activeKey}
          onActiveChange={onConversationClick}
        />
        <Button
          type="primary"
          shape="circle"
          className="configBtn"
          onClick={() => setOpen(true)}
        >
          <SmileFilled />
        </Button>
      </div>
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
          actions={(_, info) => {
            const { SendButton, LoadingButton, ClearButton } = info.components;

            return (
              <Space size="small">
                <Typography.Text type="secondary">
                  <small>清除对话</small>
                </Typography.Text>
                <ClearButton onClick={clean} disabled={false} />
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
