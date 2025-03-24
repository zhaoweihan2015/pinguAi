import { App, Form, Input, Modal, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons";

interface ConfigModalProps {
  open: boolean;
  onCancel: () => void;
  modal: string;
  setModal: (modal: string) => void;
}

export default function ConfigModal({ open, onCancel, modal, setModal }: ConfigModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const onOk = async () => {
    setLoading(true);
    const { prompt, memory } = form.getFieldsValue();
    try {
      await fetch("/api/prompt", {
        method: "POST",
        body: JSON.stringify({ prompts: prompt }),
      });

      await fetch("/api/memory", {
        method: "POST",
        body: JSON.stringify({ memory: memory.split("\n") }),
      });
      
      console.log(memory,"??")

      setModal(form.getFieldsValue().model);

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
          const [prompt, memory] = await Promise.all([
            fetch("/api/prompt").then((res) => res.json()),
            fetch("/api/memory").then((res) => res.json()),
          ]);

          form.setFieldsValue({
            model: modal,
            prompt: prompt.prompts,
            memory: memory.memory.join("\n"),
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
              <Select.Option value="deepseek-r1">DeepSeek-R1</Select.Option>
              <Select.Option value="doubao-1.5-lite-32k">Doubao-1.5-lite</Select.Option>
              <Select.Option value="doubao-1.5-vision-pro-32k">Doubao-1.5-vision-pro</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="性格" name="prompt">
            <Input.TextArea rows={8} autoSize={{ minRows: 8, maxRows: 8 }} />
          </Form.Item>
          <Form.Item label="记忆" name="memory">
            <Input.TextArea rows={8} autoSize={{ minRows: 8, maxRows: 8 }} />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
