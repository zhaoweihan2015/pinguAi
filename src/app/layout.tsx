import React from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import { ConfigProvider } from "antd";
import { GlobalProvider } from "@/lib/hooks/useGlobal";
const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <head>
      <meta name="viewport"
        content="width=device-width,
               initial-scale=1.0,
               maximum-scale=1.0,
               viewport-fit=cover"
      />
    </head>
    <body>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#FF6B6B",
          },
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