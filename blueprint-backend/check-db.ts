import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const versions = await prisma.prdVersion.findMany({
    select: { id: true, projectId: true, fileUrl: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log(JSON.stringify(versions, null, 2));
}

main().finally(() => prisma.$disconnect());
