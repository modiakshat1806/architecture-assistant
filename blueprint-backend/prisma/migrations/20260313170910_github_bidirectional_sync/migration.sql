-- CreateTable
CREATE TABLE "GitHubConnection" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "githubUserId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "accessTokenEncrypted" TEXT NOT NULL,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubRepoMapping" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "githubConnectionId" UUID NOT NULL,
    "owner" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "webhookId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubRepoMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GitHubConnection_profileId_key" ON "GitHubConnection"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubConnection_githubUserId_username_key" ON "GitHubConnection"("githubUserId", "username");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubRepoMapping_projectId_key" ON "GitHubRepoMapping"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubRepoMapping_fullName_key" ON "GitHubRepoMapping"("fullName");

-- AddForeignKey
ALTER TABLE "GitHubConnection" ADD CONSTRAINT "GitHubConnection_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubRepoMapping" ADD CONSTRAINT "GitHubRepoMapping_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubRepoMapping" ADD CONSTRAINT "GitHubRepoMapping_githubConnectionId_fkey" FOREIGN KEY ("githubConnectionId") REFERENCES "GitHubConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
