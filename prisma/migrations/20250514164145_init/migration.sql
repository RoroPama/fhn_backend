/*
  Warnings:

  - You are about to drop the column `auteur` on the `Observation` table. All the data in the column will be lost.
  - Added the required column `auteurId` to the `Observation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Observation" DROP COLUMN "auteur",
ADD COLUMN     "auteurId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
