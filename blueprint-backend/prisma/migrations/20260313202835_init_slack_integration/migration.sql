-- CreateTable
CREATE TABLE "SlackIntegration" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "workspaceName" TEXT,
    "botTokenEncrypted" TEXT NOT NULL,
    "scope" TEXT,
    "channelId" TEXT,
    "channelName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlackIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlackChannel" (
    "id" UUID NOT NULL,
    "slackIntegrationId" UUID NOT NULL,
    "slackChannelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlackChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlackEventLog" (
    "id" UUID NOT NULL,
    "slackIntegrationId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'sent',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlackEventLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SlackIntegration_profileId_key" ON "SlackIntegration"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "SlackChannel_slackIntegrationId_slackChannelId_key" ON "SlackChannel"("slackIntegrationId", "slackChannelId");

-- AddForeignKey
ALTER TABLE "SlackIntegration" ADD CONSTRAINT "SlackIntegration_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlackChannel" ADD CONSTRAINT "SlackChannel_slackIntegrationId_fkey" FOREIGN KEY ("slackIntegrationId") REFERENCES "SlackIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlackEventLog" ADD CONSTRAINT "SlackEventLog_slackIntegrationId_fkey" FOREIGN KEY ("slackIntegrationId") REFERENCES "SlackIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
