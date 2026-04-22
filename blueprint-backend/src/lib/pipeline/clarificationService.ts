import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getClarifications(projectId: string) {

  const analysis = await prisma.pipelineAnalysis.findFirst({
    where: {
      prdVersion: {
        projectId
      }
    }
  });

  if (!analysis) return [];

  return analysis.clarifications || [];
}

export async function saveClarificationAnswer(
  projectId: string,
  question: string,
  answer: string
) {

  const analysis = await prisma.pipelineAnalysis.findFirst({
    where: {
      prdVersion: {
        projectId
      }
    }
  });

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  const existing = (analysis.clarifications as any[]) || [];

  const updated = [
    ...existing,
    {
      question,
      answer,
      answeredAt: new Date().toISOString()
    }
  ];

  return prisma.pipelineAnalysis.update({
    where: {
      id: analysis.id
    },
    data: {
      clarifications: updated
    }
  });
}