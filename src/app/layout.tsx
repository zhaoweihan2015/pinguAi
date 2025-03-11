import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';
import { ConfigProvider } from 'antd';
const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body>
      <ConfigProvider theme={{
        token: {
        }
      }}>
        <AntdRegistry>{children}</AntdRegistry>
      </ConfigProvider>
    </body>
  </html>
);

export default RootLayout;