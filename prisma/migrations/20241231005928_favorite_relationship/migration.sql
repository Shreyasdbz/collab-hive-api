/*
  Warnings:

  - You are about to drop the column `favorites` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "favorites";

-- CreateTable
CREATE TABLE "_ProfileToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfileToProject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProfileToProject_B_index" ON "_ProfileToProject"("B");

-- AddForeignKey
ALTER TABLE "_ProfileToProject" ADD CONSTRAINT "_ProfileToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileToProject" ADD CONSTRAINT "_ProfileToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
