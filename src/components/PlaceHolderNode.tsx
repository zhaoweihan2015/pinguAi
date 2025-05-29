import { Space } from "antd";
import { SmileFilled } from "@ant-design/icons";

export default function Welcome() {
  return (
    <Space direction="vertical" size={16} className="placeholder">
      <div className="welcome">
        <h1> 使用说明 </h1>
        <p>
          默认使用的是deepseek-r1，如果要修改性格和模型，在左下角
          <SmileFilled />
          点击即可
        </p>
        <p>
          是否开启联网功能只有deepseek有，不开启联网数据只到2023年，但是接口返回会非常快，联网后需要等待服务器返回，大约3到4秒
        </p>
        <p>deepseek固定开启了推理功能，不想要推理把模型改成doubao</p>
        <p>视觉分析功能目前只有doubao-1.5-vision-pro模型支持</p>
        <p style={{ textDecoration: "line-through" }}>
          function
          calling功能目前只有doubao可以用，倒霉的火山引擎的deepseek不支持流式响应的时候调用tool
        </p>
        <p>经测试发现可以用，那为啥文档里写不可用呢，奇奇怪怪</p>
        <h2> v0.0.8.1 </h2>
        <p>
          修复了标题获取错误的问题,不用 fuction calling
          了,不稳定。还是直接由模型生成吧
        </p>
        <h2> v0.0.8 </h2>
        <p>增加自动填充标题功能</p>
        <div className="tip">
          <p>增加可用工具：</p>
          <p>getTitle：获取标题</p>
        </div>
        <h2> v0.0.7 </h2>
        <p>增加表情包功能</p>
        <div className="tip">
          <p>增加可用工具：</p>
          <p>getEmoji：获取表情包</p>
        </div>
        <h2> v0.0.6 </h2>
        <p>对接了doubao-1.5-vision-pro模型</p>
        <p>增加视觉分析功能</p>
        <h2> v0.0.5 </h2>
        <p>增加移动端样式</p>
        <p>以及我在思考要不要增加一个视觉分析功能</p>
        <h2> v0.0.4 </h2>
        <p>优化代码</p>
        <p>展示存储的记忆</p>
        <p>调整新对话的显示</p>
        <p>调整样式</p>
        <h2> v0.0.3 </h2>
        <p>添加了function calling功能</p>
        <div className="tip">
          <p>增加可用工具：</p>
          <p>getMemory：获取记忆</p>
          <p>setMemory：设置记忆</p>
          <p>getBilibiliHotSearch：获取B站热搜</p>
          <p>getMoYuTime：获取摸鱼日历</p>
        </div>
        <h2> v0.0.2 </h2>
        <p>添加了doubao模型</p>
        <h2> v0.0.1 </h2>
        <p>基本能完成了，可以正常使用了</p>
      </div>
    </Space>
  );
}
