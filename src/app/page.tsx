import { Metadata } from "next";
import { App } from "antd";
import Chat from "@/components/Chat";

export const metadata: Metadata = {
  title: "pingu AI",
  description: "pingu AI",
};

export default function Home() {
  return (
    <App>
      <Chat />
    </App>
  );
}
