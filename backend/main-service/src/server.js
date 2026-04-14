require("dotenv").config();

const http = require("http");

const PORT = process.env.PORT;

// create server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Server running 🚀");
});

// start
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});