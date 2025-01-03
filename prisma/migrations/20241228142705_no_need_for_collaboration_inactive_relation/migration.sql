/*
  Warnings:

  - The values [CollaboratorInactive] on the enum `CollaborationRelationship` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CollaborationRelationship_new" AS ENUM ('Creator', 'CollaboratorPending', 'CollaboratorAccepted', 'CollaboratorDeclined');
ALTER TABLE "Collaboration" ALTER COLUMN "relation" TYPE "CollaborationRelationship_new" USING ("relation"::text::"CollaborationRelationship_new");
ALTER TYPE "CollaborationRelationship" RENAME TO "CollaborationRelationship_old";
ALTER TYPE "CollaborationRelationship_new" RENAME TO "CollaborationRelationship";
DROP TYPE "CollaborationRelationship_old";
COMMIT;
