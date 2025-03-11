"use client";

import { Bubble, Conversations, Sender } from "@ant-design/x";
import { createStyles } from "antd-style";
import React, { useEffect, useMemo, useRef } from "react";
import Image from 'next/image'
import {
  CopyOutlined,
  PlusOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, type GetProp, Space, Typography } from "antd";
import { useChat } from "@ai-sdk/react";
import ChatMarkDown from "./ChatMarkDown";
import { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";
import { UIMessage } from "ai";

const defaultConversationsItems = [
  {
    key: "0",
    label: "What is Ant Design X?",
  },
];

const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      width: 100%;
      min-width: 1000px;
      height: calc(100vh - 16px);
      border-radius: ${token.borderRadius}px;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;

      .ant-prompts {
        color: ${token.colorText};
      }
    `,
    menu: css`
      background: ${token.colorBgLayout}80;
      width: 280px;
      height: 100%;
      display: flex;
      flex-direction: column;
    `,
    conversations: css`
      padding: 0 12px;
      flex: 1;
      overflow-y: auto;
    `,
    chat: css`
      height: 100%;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: ${token.paddingLG}px;
      gap: 16px;
    `,
    messages: css`
      flex: 1;
    `,
    placeholder: css`
      padding-top: 32px;
    `,
    sender: css`
      box-shadow: ${token.boxShadow};
    `,
    logo: css`
      display: flex;
      height: 72px;
      align-items: center;
      justify-content: start;
      padding: 0 24px;
      box-sizing: border-box;

      img {
        width: 24px;
        height: 24px;
        display: inline-block;
      }

      span {
        display: inline-block;
        margin: 0 8px;
        font-weight: bold;
        color: ${token.colorText};
        font-size: 16px;
      }
    `,
    addBtn: css`
      background: #1677ff0f;
      border: 1px solid #1677ff34;
      width: calc(100% - 24px);
      margin: 0 12px 24px 12px;
    `,
    reasoning: css`
      font-size: 12px;
      color: #999;
      padding-left: 10px;
      padding-right: 10px;
      max-height: 300px;
      overflow-y: auto;
      overflow-x: hidden;
      background-color: #f7f7f7;
      border-radius: 10px;
      margin-bottom: 10px;
    `,
  };
});

const roles: GetProp<typeof Bubble.List, "roles"> = {
  ai: {
    placement: "start",
    avatar: { icon: <Image src="/pingu.png" alt="pingu" width={32} height={32} />, style: { background: "#fde3cf" } },
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
  // ==================== Style ====================
  const { styles } = useStyle();

  // ==================== State ====================
  const [conversationsItems, setConversationsItems] = React.useState(
    defaultConversationsItems
  );

  const [activeKey, setActiveKey] = React.useState(
    defaultConversationsItems[0].key
  );

  // ==================== Runtime ====================
  const { messages, input, reload, setMessages, setInput, append, status, stop } = useChat();

  // ==================== Event ====================
  const onSubmit = (nextContent: string) => {
    if (!nextContent) return;
    append({ role: "user", content: nextContent });
    setInput("");
  };

  const loading = useMemo(
    () => status === "submitted" || status === "streaming",
    [status]
  );

  const onAddConversation = () => {
    setConversationsItems([
      ...conversationsItems,
      {
        key: `${conversationsItems.length}`,
        label: `New Conversation ${conversationsItems.length}`,
      },
    ]);
    setActiveKey(`${conversationsItems.length}`);
  };

  const onConversationClick: GetProp<typeof Conversations, "onActiveChange"> = (
    key
  ) => {
    setActiveKey(key);
  };

  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    if (chatRef.current) {
      const div = chatRef.current.querySelector(".ant-bubble-list");
      div?.scrollTo(0, 9999999);
    }
  }, [lastMessage?.reasoning, lastMessage?.content]);

  const clean = () => {
    stop();
    setMessages([]);
    setInput("");
  };

  const copy = (message: string) => {
    navigator.clipboard.writeText(message);
  }

  const reloadMessage = (message: UIMessage) => {
    reload(message);
  }

  // ==================== Nodes ====================
  const chatRef = useRef<HTMLDivElement>(null);

  const placeholderNode = (
    <Space direction="vertical" size={16} className={styles.placeholder}>
      开始对话
    </Space>
  );

  const items: GetProp<typeof Bubble.List, "items"> = useMemo(() => {
    return messages.map((message, index) => {
      if (message.role === "user") {
        return {
          key: message.id,
          role: "user",
          content: message.content,
          messageRender: (content) => {
            // return <ChatMarkDown>{content}</ChatMarkDown>;
            return <div>{content}</div>;
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
                <div className={styles.reasoning}>
                  <ChatMarkDown>{message.reasoning}</ChatMarkDown>
                </div>
                <ChatMarkDown>{content}</ChatMarkDown>
              </div>
            );
          },
        }

        if(index === messages.length - 1) {
          set.footer = (
            <Space>
              <Button color="default" variant="text" size="small" icon={<SyncOutlined />} onClick={() => reloadMessage(message)} />
              <Button color="default" variant="text" size="small" icon={<CopyOutlined />} onClick={() => copy(message.content)} />
            </Space>
          )
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
    <div className={styles.layout}>
      <div className={styles.menu}>
        {/* 🌟 添加会话 */}
        <Button
          onClick={onAddConversation}
          type="link"
          className={styles.addBtn}
          icon={<PlusOutlined />}
        >
          New Conversation
        </Button>
        {/* 🌟 会话管理 */}
        <Conversations
          items={conversationsItems}
          className={styles.conversations}
          activeKey={activeKey}
          onActiveChange={onConversationClick}
        />
      </div>
      <div className={styles.chat} ref={chatRef}>
        {/* 🌟 消息列表 */}
        <Bubble.List
          items={
            items.length > 0
              ? items
              : [{ content: placeholderNode, variant: "borderless" }]
          }
          roles={roles}
          className={styles.messages}
        />
        {/* 🌟 输入框 */}
        <Sender
          value={input}
          onSubmit={onSubmit}
          onChange={setInput}
          loading={loading}
          className={styles.sender}
          actions={(_, info) => {
            const { SendButton, LoadingButton, ClearButton } = info.components;
    
            return (
              <Space size="small">
                <Typography.Text type="secondary">
                  <small>清除对话</small>
                </Typography.Text>
                <ClearButton onClick={clean} disabled={false} />
                {loading ? (
                  <LoadingButton type="default" onClick={stop} disabled={false} />
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
