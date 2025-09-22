-- CreateTable
CREATE TABLE "ShareConfiguration" (
    "id" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShareConfiguration_shareId_key" ON "ShareConfiguration"("shareId");

-- CreateIndex
CREATE INDEX "ShareConfiguration_shareId_idx" ON "ShareConfiguration"("shareId");
