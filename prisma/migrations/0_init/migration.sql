-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "polyhedraShape" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    "subtitle" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "ogImage" TEXT,
    "sourceUrl" TEXT,
    "topicId" TEXT,
    CONSTRAINT "Post_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "TopicSubscription" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Revision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "markdown" TEXT NOT NULL,
    "polyhedraShape" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    CONSTRAINT "Revision_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'writer',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "linkedIn" TEXT,
    "title" TEXT,
    "company" TEXT,
    "companyUrl" TEXT,
    "industry" TEXT,
    "employees" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LeadVisit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "userAgent" TEXT,
    "pageUrl" TEXT,
    "referrer" TEXT,
    "rawPayload" TEXT,
    "visitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadVisit_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AISettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "rules" TEXT NOT NULL DEFAULT '',
    "chatRules" TEXT NOT NULL DEFAULT '',
    "defaultModel" TEXT NOT NULL DEFAULT 'claude-sonnet',
    "anthropicApiKey" TEXT,
    "openaiApiKey" TEXT,
    "generateTemplate" TEXT,
    "chatTemplate" TEXT,
    "rewriteRules" TEXT,
    "rewriteTemplate" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "siteTitle" TEXT NOT NULL DEFAULT '',
    "siteTitleTemplate" TEXT NOT NULL DEFAULT '%s | {name}',
    "siteDescription" TEXT NOT NULL DEFAULT '',
    "siteKeywords" TEXT NOT NULL DEFAULT '',
    "twitterHandle" TEXT NOT NULL DEFAULT '',
    "orgName" TEXT NOT NULL DEFAULT '',
    "orgLogo" TEXT NOT NULL DEFAULT '',
    "orgSameAs" TEXT NOT NULL DEFAULT '[]',
    "defaultOgImage" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PageSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "ogImage" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "IntegrationSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "googleAnalyticsId" TEXT,
    "rb2bApiKey" TEXT,
    "contactEmail" TEXT,
    "anthropicApiKey" TEXT,
    "openaiApiKey" TEXT,
    "autoDraftEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TopicSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "rssFeeds" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "maxPerPeriod" INTEGER NOT NULL DEFAULT 3,
    "lastRunAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "publishedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "postId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NewsItem_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "TopicSubscription" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NewsItem_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_company_idx" ON "Lead"("company");

-- CreateIndex
CREATE INDEX "Lead_linkedIn_idx" ON "Lead"("linkedIn");

-- CreateIndex
CREATE INDEX "LeadVisit_leadId_idx" ON "LeadVisit"("leadId");

-- CreateIndex
CREATE INDEX "LeadVisit_visitedAt_idx" ON "LeadVisit"("visitedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PageSettings_path_key" ON "PageSettings"("path");

-- CreateIndex
CREATE UNIQUE INDEX "NewsItem_url_key" ON "NewsItem"("url");

-- CreateIndex
CREATE UNIQUE INDEX "NewsItem_postId_key" ON "NewsItem"("postId");

-- CreateIndex
CREATE INDEX "NewsItem_topicId_idx" ON "NewsItem"("topicId");

-- CreateIndex
CREATE INDEX "NewsItem_status_idx" ON "NewsItem"("status");

