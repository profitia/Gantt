import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const dbUrl = process.env['DATABASE_URL'] ?? 'file:./prisma/dev.db';

// Convert file: paths to absolute libsql URLs
const libsqlUrl = dbUrl.startsWith('file:./') || dbUrl.startsWith('file:../') || dbUrl === 'file:dev.db'
  ? `file:${process.cwd()}/${dbUrl.slice(5)}`
  : dbUrl;

const adapter = new PrismaLibSql({ url: libsqlUrl });
const prisma = new PrismaClient({ adapter });

export default prisma;
