// import Markdown from "react-markdown";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// // import hljs from "highlight.js";

// export default function ChatMarkDown({ children, pre = true }: { children: string | undefined, pre?: boolean }) {
//   return (
//     <Markdown
//       components={{
//         code({ children, className }) {
//           const match = /language-(\w+)/.exec(className || "");
//           return pre ? (
//             <SyntaxHighlighter
//               language={(match && match[1]) || ""}
//             >
//               {String(children).replace(/\n$/, "")}
//             </SyntaxHighlighter>
//           ) : (
//             <code className={className}>{children}</code>
//           );
//         },
//       }}
//     >
//       {children || ''}
//     </Markdown>
//   );
// }

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

export default function ChatMarkDown({ children, key }: { children: string | undefined, key: string }) {
  return <div dangerouslySetInnerHTML={{ __html: md.render(children || "") }} key={key} />;
}