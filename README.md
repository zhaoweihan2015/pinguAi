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
