/*
  Warnings:

  - You are about to drop the column `statut_dossier` on the `Enfant` table. All the data in the column will be lost.
  - Added the required column `statut_dossier` to the `Dossier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dossier" ADD COLUMN     "statut_dossier" "Statut" NOT NULL;

-- AlterTable
ALTER TABLE "Enfant" DROP COLUMN "statut_dossier";
