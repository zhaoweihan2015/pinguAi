import { tool } from "ai";
import { z } from "zod";
import chalk from "chalk";
import db from "@/db/db";
import dayjs from "dayjs";
import { getPublicFiles } from "@/lib/file-store"

// 获取B站实时热搜榜单
const getBilibiliHotSearch = tool({
  description: "获取B站实时热搜榜单",
  parameters: z.object({
    limit: z.number().describe("返回的热搜条目数量"),
  }),
  execute: async ({ limit }) => {
    console.log(chalk.blue("使用了工具getBilibiliHotSearch"));

    const result: { data: { title: string; heat: string; link: string }[] } =
      await fetch("https://v.api.aa1.cn/api/bilibili-rs/").then((res) =>
        res.json()
      );

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
    console.log(chalk.blue("使用了工具getMoYuTime"));

    return {
      node: "<img src='https://dayu.qqsuu.cn/moyuribao/apis.php' />",
      use: "把node里的内容放到内容里",
    };
  },
});

const setMemory = tool({
  description: "把我说需要记忆，记住的内容进行存储",
  parameters: z.object({
    memory: z.string().describe("记忆内容"),
  }),
  execute: async ({ memory }) => {
    console.log(chalk.blue("使用了工具setMemory"));

    await db.read();

    const { memory: oldMemory } = db.data;

    if(oldMemory.includes(memory)) {
      return `记忆已存在,不用再记忆`;
    }

    const newMemory = [...oldMemory, memory];
    console.log(newMemory);
    db.data.memory = newMemory;

    await db.write();
    
    return `记忆已更新：${memory}`;
  },
});

const getMemory = tool({
  description: "获取记忆内容",
  parameters: z.object({}),
  execute: async () => {
    console.log(chalk.blue("使用了工具getMemory"));

    const { memory } = db.data;

    return memory;
  },
});

const getTime = tool({
  description: "获取当前时间",
  parameters: z.object({}),
  execute: async () => {
    return dayjs().format("YYYY-MM-DD HH:mm:ss");
  },
});

const getDate = tool({
  description: "获取当前日期",
  parameters: z.object({}),
  execute: async () => {
    return dayjs().format("YYYY-MM-DD");
  },
});

const getEmoji = tool({
  description: "根据对话选择表情图",
  parameters: z.object({
    name: z.string().describe("表情名字, 已有的表情为" + getPublicFiles().join("，"))
  }),
  execute: async ({name}) => {
    console.log(chalk.blue("使用了工具getEmoji：" + name), getPublicFiles());
    return `<img src="/image/${name}" alt="${name}" width="100px" height="100px" />`
  }
})

const tools = {
  getBilibiliHotSearch,
  getMoYuTime,
  setMemory,
  getMemory,
  getTime,
  getDate,
  getEmoji
};

export default tools;
