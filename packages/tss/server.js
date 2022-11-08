const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const port = 3000;
const dev = process.env.NODE_ENV !== "production";
console.log("dev=", dev);
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer({
      key: fs.readFileSync('./cert/local/out/sync-server.key'),
      cert: fs.readFileSync('./cert/local/out/sync-server.cert'),
      //ca: [fs.readFileSync('./cert/local/out/localCA.pem')],
    }, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(port, (err) => {
        if (err) throw err;
        console.log("ready - started server on url: https://localhost:" + port);
    });
});

