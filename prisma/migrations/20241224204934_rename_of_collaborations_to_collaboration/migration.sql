/*
  Warnings:

  - You are about to drop the `Collaborations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Collaborations" DROP CONSTRAINT "Collaborations_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "Collaborations" DROP CONSTRAINT "Collaborations_project_id_fkey";

-- DropTable
DROP TABLE "Collaborations";

-- CreateTable
CREATE TABLE "Collaboration" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "relation" "CollaborationRelationship" NOT NULL,

    CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
