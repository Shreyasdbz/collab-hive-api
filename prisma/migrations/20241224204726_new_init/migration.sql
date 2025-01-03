/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `favoriteCount` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `projectComplexity` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `techStack` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `Collaboration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Favorite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectLink` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `complexity` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_open` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CollaborationRelationship" AS ENUM ('Creator', 'CollaboratorPending', 'CollaboratorAccepted', 'CollaboratorDeclined', 'CollaboratorInactive');

-- DropForeignKey
ALTER TABLE "Collaboration" DROP CONSTRAINT "Collaboration_collaboratorId_fkey";

-- DropForeignKey
ALTER TABLE "Collaboration" DROP CONSTRAINT "Collaboration_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectDocument" DROP CONSTRAINT "ProjectDocument_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectLink" DROP CONSTRAINT "ProjectLink_projectId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "createdAt",
DROP COLUMN "creatorId",
DROP COLUMN "favoriteCount",
DROP COLUMN "projectComplexity",
DROP COLUMN "techStack",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "complexity" TEXT NOT NULL,
ADD COLUMN     "favorite_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_open" BOOLEAN NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "roles_open" TEXT[],
ADD COLUMN     "technologies" TEXT[];

-- DropTable
DROP TABLE "Collaboration";

-- DropTable
DROP TABLE "Favorite";

-- DropTable
DROP TABLE "ProjectDocument";

-- DropTable
DROP TABLE "ProjectLink";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "CollaborationStatus";

-- DropEnum
DROP TYPE "ProjectComplexity";

-- CreateTable
CREATE TABLE "AttachmentLink" (
    "id" TEXT NOT NULL,
    "link_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "profileId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "AttachmentLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "favorites" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collaborations" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "relation" "CollaborationRelationship" NOT NULL,

    CONSTRAINT "Collaborations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- AddForeignKey
ALTER TABLE "AttachmentLink" ADD CONSTRAINT "AttachmentLink_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttachmentLink" ADD CONSTRAINT "AttachmentLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborations" ADD CONSTRAINT "Collaborations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborations" ADD CONSTRAINT "Collaborations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
