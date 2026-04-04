-- CreateIndex
CREATE INDEX "Thread_userId_idx" ON "Thread"("userId");

-- CreateIndex
CREATE INDEX "Thread_userId_createdAt_idx" ON "Thread"("userId", "createdAt");
