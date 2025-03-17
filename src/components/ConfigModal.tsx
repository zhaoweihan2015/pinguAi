import { App, Form, Input, Modal, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons";

interface ConfigModalProps {
  open: boolean;
  onCancel: () => void;
}

export default function ConfigModal({ open, onCancel }: ConfigModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const onOk = async () => {
    setLoading(true);
    const { prompt } = form.getFieldsValue();
    try {
      await fetch("/api/prompt", {
        method: "POST",
        body: JSON.stringify({ prompts: prompt }),
      });
      message.success("配置成功");
      onCancel();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      (async () => {
        setLoading(true);
        try {
          const prompt = await fetch("/api/prompt").then((res) => res.json());

          form.setFieldsValue({
            prompt: prompt.prompts,
          });
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      confirmLoading={loading}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      width={600}
      title={
        <span>
          <UserOutlined /> 配置
        </span>
      }
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            model: "deepseek",
            prompt: "",
          }}
        >
          <Form.Item label="模型" name="model">
            <Select>
              <Select.Option value="deepseek">DeepSeek</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Prompt" name="prompt">
            <Input.TextArea rows={8} autoSize={{ minRows: 8, maxRows: 8 }} />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
