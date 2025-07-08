const http  = require('http');
const { parse } = require('url');
const next  = require('next');

const port = 3000;    
const dev  = false;                       


const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http
    .createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
    .listen(port, '127.0.0.1', () => {
      console.log(`> Next.js server ready at http://localhost:${port}`);
    });
});
