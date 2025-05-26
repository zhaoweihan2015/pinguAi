import Image from "next/image";
import { Button, GetProp, Space } from "antd";
import { Bubble } from "@ant-design/x";
import PlaceHolderNode from "./PlaceHolderNode";
import { CopyOutlined, SyncOutlined, UserOutlined } from "@ant-design/icons";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Message } from "ai";
import ChatMarkDown from "./ChatMarkDown";
import { BubbleDataType } from "@ant-design/x/es/bubble/BubbleList";
import { SenderRef } from "./Sender";

interface BubbleProps {
  messages: Message[];
  senderRef: React.RefObject<SenderRef | null>;
}

export type BubbleRef = {
  showMemory: () => void;
};

const BubbleComponent = forwardRef<BubbleRef, BubbleProps>(
  ({ messages, senderRef }, ref) => {
    const timer = useRef<NodeJS.Timeout | null>(null);

    const [showMemoryUpdate, setShowMemoryUpdate] = useState(false);

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

    useImperativeHandle(ref, () => ({
      showMemory: () => {
        if (timer.current) clearTimeout(timer.current);

        setShowMemoryUpdate(true);

        timer.current = setTimeout(() => {
          setShowMemoryUpdate(false);
        }, 5000);
      },
    }));

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

    const copy = (message: string) => {
      navigator.clipboard.writeText(message);
    };

    return (
      <Bubble.List
        items={
          items.length > 0
            ? items
            : [{ content: <PlaceHolderNode />, variant: "borderless" }]
        }
        roles={roles}
        className="messages"
      />
    );
  }
);

BubbleComponent.displayName = "BubbleComponent";

export default BubbleComponent;
