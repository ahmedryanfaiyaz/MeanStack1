const app = require("./app");
const http = require("http");

const server = http.createServer(app);
const port = parseInt(process.env.PORT)  || 3000;
server.listen(port);
