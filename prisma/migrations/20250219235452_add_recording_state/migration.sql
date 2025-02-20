-- CreateTable
CREATE TABLE "RecordingState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isRecording" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RecordingState_processId_key" ON "RecordingState"("processId");
