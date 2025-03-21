import { Conversations, ConversationsProps } from "@ant-design/x";
import { App, Button, Drawer, GetProp } from "antd";
import { DeleteOutlined, PlusOutlined, SmileFilled, UnorderedListOutlined } from "@ant-design/icons";
import { useGlobalState } from "@/lib/hooks/useGlobal";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { ConversationType } from "@/db/db";
import { Message, UIMessage } from "ai";

interface MenuProps {
  setOpen: (open: boolean) => void;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  setInput: (input: string) => void;
}

interface MenuDrawerProps {
  children: React.ReactNode;
}

export interface MenuRef {
  handleConversation: (
    messages: UIMessage[],
    create?: boolean
  ) => Promise<void>;
}

const MenuDrawer: React.FC<MenuDrawerProps> = ({ children }) => {
  const [useDrawer, setUseDrawer] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth < 1000) {
        setUseDrawer(true);
      } else {
        setUseDrawer(false);
      }
    });

    return () => {
      window.removeEventListener("resize", () => {});
    };
  }, []);

  return (
    useDrawer ? (
      <>
        <div className="menuBtnContainer">
          <Button
            type="primary"
            className="menuBtn"
            onClick={() => setDrawerOpen(true)}
          >
            <UnorderedListOutlined />
          </Button>
        </div>
        <Drawer footer={null} width={400} placement="left" title={null} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          { children }
        </Drawer>
      </>
    ) : (
      children
    )
  );
};

const Menu = forwardRef<MenuRef, MenuProps>(
  ({ setOpen, setMessages, setInput }, ref) => {
    const { activeKey, updateActiveKey } = useGlobalState();
    const { message } = App.useApp();

    const [conversationsItems, setConversationsItems] = useState<
      GetProp<typeof Conversations, "items">
    >([]);

    useEffect(() => {
      getConversation();
    }, []);

    useImperativeHandle(ref, () => ({
      handleConversation,
    }));

    const handleConversation = useCallback(
      async (messages: UIMessage[] = [], create = false) => {
        const id = create ? new Date().getTime().toString() : activeKey;

        const name = messages[0]?.content.slice(0, 10) ?? "新的对话";

        try {
          await fetch("/api/conversation", {
            method: "POST",
            body: JSON.stringify({
              key: id,
              name,
              messages: JSON.stringify(messages),
            }),
          });

          const _conversationsItems = [...conversationsItems];

          const nowItem = _conversationsItems.find((item) => item.key === id);

          if (create) {
            _conversationsItems.push({
              key: id,
              label: name,
              messages: JSON.stringify(messages),
            });
          } else if (nowItem) {
            nowItem.messages = JSON.stringify(messages);
            nowItem.label = name;
          }

          setConversationsItems(_conversationsItems);

          updateActiveKey(id);
        } catch (error) {
          console.error(error);
        }
      },
      [conversationsItems, activeKey, updateActiveKey]
    );

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

    const handleDelete = async (key: string) => {
      try {
        await fetch("/api/conversation", {
          method: "DELETE",
          body: JSON.stringify({ key }),
        });

        updateActiveKey("");
        setMessages([]);
        setInput("");

        getConversation();

        message.success("删除成功");
      } catch (error) {
        console.error(error);
      }
    };

    const menuConfig: ConversationsProps["menu"] = (conversation) => ({
      items: [
        {
          label: "删除",
          key: "delete",
          icon: <DeleteOutlined />,
          danger: true,
        },
      ],
      onClick: (menuInfo) => {
        if (menuInfo.key === "delete") {
          handleDelete(conversation.key);
        }
      },
    });

    const onConversationClick: GetProp<
      typeof Conversations,
      "onActiveChange"
    > = (key) => {
      updateActiveKey(key);

      setMessages(
        JSON.parse(
          conversationsItems.find((item) => item.key === key)?.messages ?? "[]"
        )
      );
    };

    const addConversation = () => {
      setMessages([]);

      handleConversation([], true);
    };

    return (
      <MenuDrawer>
      <div className="menu">
        {/* 🌟 添加会话 */}
        <Button
          onClick={addConversation}
          type="primary"
          className="addBtn"
          icon={<PlusOutlined />}
        >
          添加对话
        </Button>
        {/* 🌟 会话管理 */}
        <Conversations
          items={conversationsItems}
          className="conversations"
          activeKey={activeKey}
          menu={menuConfig}
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
      </MenuDrawer>
    );
  }
);

Menu.displayName = "Menu";

export default Menu;
