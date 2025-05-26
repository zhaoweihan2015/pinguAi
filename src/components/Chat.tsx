"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useGlobalState } from "@/lib/hooks/useGlobal";
import ConfigModal from "./ConfigModal";
import Menu, { MenuRef } from "./Menu";
import PlaceHolderNode from "./PlaceHolderNode";
import SenderComponent, { SenderRef } from "./Sender";
import BubbleComponent, { BubbleRef } from "./Bubble";

export interface UploadFile {
  uid: string;
  name: string;
  base64: string;
  mimeType: string;
}

const Independent: React.FC = () => {
  // ==================== Nodes ====================
  const chatRef = useRef<HTMLDivElement>(null);
  const senderRef = useRef<SenderRef>(null);
  const menuRef = useRef<MenuRef>(null);
  const bubbleRef = useRef<BubbleRef>(null);
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
        bubbleRef.current?.showMemory();
      }
    },
  });
  // ==================== State ====================
  const { activeKey } = useGlobalState();

  const [open, setOpen] = React.useState(false);

  const loading = useMemo(
    () => status === "submitted" || status === "streaming",
    [status]
  );

  const [modal, setModal] = React.useState("deepseek-r1");
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
          <BubbleComponent
            ref={bubbleRef}
            messages={messages}
            senderRef={senderRef}
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
