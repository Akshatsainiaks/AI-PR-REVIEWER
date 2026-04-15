const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config();

// create postgres pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// create adapter
const adapter = new PrismaPg(pool);

// pass adapter to prisma
const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;