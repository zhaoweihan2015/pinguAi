import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value ?? "";
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (__) {}
    }
    return "";
  },
});

export default function ChatMarkDown({ children}: { children: string | undefined }) {
  return <div dangerouslySetInnerHTML={{ __html: md.render(children || "") }} />;
}