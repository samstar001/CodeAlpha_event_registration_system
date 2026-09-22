// config/prisma.js — creates one shared Prisma Client instance, connected via the pg adapter
import { PrismaClient } from "../generated/prisma/client.js"; // generated client
import { PrismaPg } from "@prisma/adapter-pg"; // driver adapter, required in Prisma 7
import dotenv from "dotenv";

dotenv.config(); // ensures process.env.DATABASE_URL is available here too

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL }); // runtime connection
const prisma = new PrismaClient({ adapter }); // Client now takes the adapter, not a raw url

export default prisma;
