import { tool } from "ai";
import { z } from "zod";
import chalk from "chalk";

// 获取指定地点的天气信息
const getWeather = tool({
  description: "获取指定地点的天气信息",
  parameters: z.object({
    location: z.string().describe("要查询天气的地点"),
  }),
  execute: async ({ location }) => {
    console.log(chalk.blue("使用了工具getWeather"))

    return {
      location,
      temperature: 22,
    }; // 示例返回值
  },
});

// 获取B站实时热搜榜单
const getBilibiliHotSearch = tool({
  description: "获取B站实时热搜榜单",
  parameters: z.object({
    limit: z.number().describe("返回的热搜条目数量"),
  }),
  execute: async ({ limit }) => {   
    console.log(chalk.blue("使用了工具getBilibiliHotSearch"))

    const result: { data: { title: string, heat: string, link: string }[] } = await fetch("https://v.api.aa1.cn/api/bilibili-rs/").then(res => res.json())

    return {
      limit,
      hotSearch: result.data.slice(0, limit),
    }; // 示例返回值
  },
});

// 获取摸鱼时间
const getMoYuTime = tool({
  description: "获取摸鱼日历",
  parameters: z.object({}),
  execute: async () => {
    console.log(chalk.blue("使用了工具getMoYuTime"))

    return {
        node: "<img src='https://dayu.qqsuu.cn/moyuribao/apis.php' />",
        use: "把node里的内容放到内容里"
    }
  },
});

const tools = {
  getWeather,
  getBilibiliHotSearch,
  getMoYuTime
};

export default tools;
