import React from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import { ConfigProvider } from "antd";
import { GlobalProvider } from "@/lib/hooks/useGlobal";
const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body>
      <ConfigProvider
        theme={{
          token: {},
        }}
      >
        <GlobalProvider>
          <AntdRegistry>{children}</AntdRegistry>
        </GlobalProvider>
      </ConfigProvider>
    </body>
  </html>
);

export default RootLayout;