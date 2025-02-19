-- CreateTable
CREATE TABLE "CollapseState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isCollapsed" BOOLEAN NOT NULL DEFAULT false,
    "processId" TEXT NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CollapseState_processId_type_key" ON "CollapseState"("processId", "type");
