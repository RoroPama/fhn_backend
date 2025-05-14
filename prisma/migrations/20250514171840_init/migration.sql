/*
  Warnings:

  - Added the required column `dossierId` to the `ParcoursMedicalTARII` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dossierId` to the `ParcoursMedicalWiSi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ParcoursMedicalTARII" ADD COLUMN     "dossierId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ParcoursMedicalWiSi" ADD COLUMN     "dossierId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ParcoursMedicalWiSi" ADD CONSTRAINT "ParcoursMedicalWiSi_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcoursMedicalTARII" ADD CONSTRAINT "ParcoursMedicalTARII_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
