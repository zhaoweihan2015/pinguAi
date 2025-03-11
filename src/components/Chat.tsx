"use client";

import { Bubble, Conversations, Prompts, Sender, Welcome } from "@ant-design/x";
import { createStyles } from "antd-style";
import React, { useEffect, useMemo, useRef } from "react";

import {
  CommentOutlined,
  EllipsisOutlined,
  FireOutlined,
  HeartOutlined,
  PlusOutlined,
  ReadOutlined,
  ShareAltOutlined,
  SmileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, type GetProp, Space } from "antd";
import { useChat } from "@ai-sdk/react";
import ChatMarkDown from "./ChatMarkDown";

const renderTitle = (icon: React.ReactElement, title: string) => (
  <Space align="start">
    {icon}
    <span>{title}</span>
  </Space>
);

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

const placeholderPromptsItems: GetProp<typeof Prompts, "items"> = [
  {
    key: "1",
    label: renderTitle(
      <FireOutlined style={{ color: "#FF4D4F" }} />,
      "Hot Topics"
    ),
    description: "What are you interested in?",
    children: [
      {
        key: "1-1",
        description: `What's new in X?`,
      },
      {
        key: "1-2",
        description: `What's AGI?`,
      },
      {
        key: "1-3",
        description: `Where is the doc?`,
      },
    ],
  },
  {
    key: "2",
    label: renderTitle(
      <ReadOutlined style={{ color: "#1890FF" }} />,
      "Design Guide"
    ),
    description: "How to design a good product?",
    children: [
      {
        key: "2-1",
        icon: <HeartOutlined />,
        description: `Know the well`,
      },
      {
        key: "2-2",
        icon: <SmileOutlined />,
        description: `Set the AI role`,
      },
      {
        key: "2-3",
        icon: <CommentOutlined />,
        description: `Express the feeling`,
      },
    ],
  },
];

const roles: GetProp<typeof Bubble.List, "roles"> = {
  ai: {
    placement: "start",
    avatar: { icon: <UserOutlined />, style: { background: "#fde3cf" } },
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
  const { messages, input, setInput, append, status, stop } = useChat();

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

  const onPromptsItemClick: GetProp<typeof Prompts, "onItemClick"> = (info) => {
    append({ role: "user", content: info.data.description as string });
  };

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

  // ==================== Nodes ====================
  const chatRef = useRef<HTMLDivElement>(null);

  const placeholderNode = (
    <Space direction="vertical" size={16} className={styles.placeholder}>
      <Welcome
        variant="borderless"
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title="Hello, I'm Ant Design X"
        description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
        extra={
          <Space>
            <Button icon={<ShareAltOutlined />} />
            <Button icon={<EllipsisOutlined />} />
          </Space>
        }
      />
      <Prompts
        title="Do you want?"
        items={placeholderPromptsItems}
        styles={{
          list: {
            width: "100%",
          },
          item: {
            flex: 1,
          },
        }}
        onItemClick={onPromptsItemClick}
      />
    </Space>
  );

  const items: GetProp<typeof Bubble.List, "items"> = useMemo(() => {
    return messages.map((message) => {
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
        return {
          key: message.id,
          role: "ai",
          content: message.content,
          messageRender: (content) => {
            return (
              <div>
                <div className={styles.reasoning}>
                  <ChatMarkDown>{message.reasoning}</ChatMarkDown>
                  {/* <div>{message.reasoning}</div> */}
                </div>
                <ChatMarkDown>{content}</ChatMarkDown>
                {/* <div>{content}</div> */}
              </div>
            );
          },
        };
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
          onCancel={stop}
        />
      </div>
    </div>
  );
};

export default Independent;
