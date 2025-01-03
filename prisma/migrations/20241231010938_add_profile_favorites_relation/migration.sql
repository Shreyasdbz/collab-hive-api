/*
  Warnings:

  - You are about to drop the `_ProfileToProject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProfileToProject" DROP CONSTRAINT "_ProfileToProject_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProfileToProject" DROP CONSTRAINT "_ProfileToProject_B_fkey";

-- DropTable
DROP TABLE "_ProfileToProject";

-- CreateTable
CREATE TABLE "_ProfileFavorites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfileFavorites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProfileFavorites_B_index" ON "_ProfileFavorites"("B");

-- AddForeignKey
ALTER TABLE "_ProfileFavorites" ADD CONSTRAINT "_ProfileFavorites_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileFavorites" ADD CONSTRAINT "_ProfileFavorites_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
