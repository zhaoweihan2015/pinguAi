自用 AI，暴躁企鹅

Next.js + Ant Design X + AI SDK + LowDB + DeepSeek/Doubao

## 使用说明

默认使用的是 deepseek-r1，如果要修改性格和模型，在左下角点击即可

是否开启联网功能只有 deepseek 有，不开启联网数据只到 2023 年，但是接口返回会非常快，联网后需要等待服务器返回，大约 3 到 4 秒

deepseek 固定开启了推理功能，不想要推理把模型改成 doubao

~~function calling 功能目前只有 doubao 可以用，倒霉的火山引擎的 deepseek 不支持流式响应的时候调用 tool~~

经测试发现可以用，那为啥文档里写不可用呢，奇奇怪怪

## 更新日志

### v0.0.1

- 基本能完成了，可以正常使用了

### v0.0.2

- 添加了 doubao 模型

### v0.0.3

- 添加了 function calling 功能

  > 增加可用工具：
  >
  > getMemory：获取记忆
  >
  > setMemory：设置记忆
  >
  > getBilibiliHotSearch：获取 B 站热搜
  >
  > getMoYuTime：获取摸鱼日历

### v0.0.4

- 优化代码
- 展示存储的记忆
- 调整新对话的显示
- 调整样式

### v0.0.5

- 增加移动端样式
- 以及我在思考要不要增加一个视觉分析功能

### v0.0.6

- 对接了 doubao-1.5-vision-pro 模型
- 增加视觉分析功能

### v0.0.7

- 增加表情包功能

  > 增加可用工具：
  >
  > getEmoji：获取表情包

### v0.0.8

- 增加自动填充标题功能

  > 增加可用工具：
  >
  > getTitle：获取标题

### v0.0.8.1

- 修复了标题获取错误的问题,不用 fuction calling 了,不稳定。还是直接由模型生成吧

### v0.1.0

- 终于用Electron裹好了，现在打包安装好后，可以双击开启项目的时候，在Electron内跑next服务，用起来更方便了