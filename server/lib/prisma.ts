import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.ts';

// NOTE: Prisma codegen output is under generated/prisma/client.ts.
// At runtime with ESM + tsx/ts-node, importing the .ts entrypoint via extensionless path is more reliable.


const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export default prisma