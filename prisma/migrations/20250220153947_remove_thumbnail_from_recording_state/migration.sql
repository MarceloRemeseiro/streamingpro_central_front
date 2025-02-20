/*
  Warnings:

  - You are about to drop the column `thumbnailFile` on the `RecordingState` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "RecordingThumbnail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordingFile" TEXT NOT NULL,
    "thumbnailFile" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RecordingState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "processId" TEXT NOT NULL,
    "isRecording" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastRecordingFile" TEXT
);
INSERT INTO "new_RecordingState" ("id", "isRecording", "lastRecordingFile", "lastUpdated", "processId") SELECT "id", "isRecording", "lastRecordingFile", "lastUpdated", "processId" FROM "RecordingState";
DROP TABLE "RecordingState";
ALTER TABLE "new_RecordingState" RENAME TO "RecordingState";
CREATE UNIQUE INDEX "RecordingState_processId_key" ON "RecordingState"("processId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RecordingThumbnail_recordingFile_key" ON "RecordingThumbnail"("recordingFile");
