const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config();


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});


const adapter = new PrismaPg(pool);


const prisma = new PrismaClient({
  adapter,
  log: ["query", "error", "warn"],
});


process.on("SIGINT", async () => {
  await prisma.$disconnect();
  await pool.end();
  console.log("Prisma + DB disconnected");
  process.exit(0);
});

module.exports = prisma;