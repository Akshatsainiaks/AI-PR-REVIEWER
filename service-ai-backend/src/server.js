require("dotenv").config();

const http = require("http");
const app = require("./app"); // ✅ IMPORTANT

const PORT = process.env.PORT || 3000;


const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});