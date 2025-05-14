/*
  Warnings:

  - Added the required column `natureId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `etablissementId` to the `Dossier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `est_scolarise` to the `Enfant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "natureId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Dossier" ADD COLUMN     "etablissementId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Enfant" ADD COLUMN     "activites_quotidiennes" TEXT,
ADD COLUMN     "ancien_etablissement" TEXT,
ADD COLUMN     "est_scolarise" BOOLEAN NOT NULL,
ADD COLUMN     "niveau_scolaire" TEXT;

-- CreateTable
CREATE TABLE "ParcoursMedicalWiSi" (
    "id" TEXT NOT NULL,
    "a_consulte_ophtalmo" BOOLEAN NOT NULL,
    "a_autre_suivi_medical" BOOLEAN NOT NULL,
    "details_suivi_medical" TEXT,
    "a_perception_visuelle" BOOLEAN NOT NULL,
    "est_aveugle" BOOLEAN NOT NULL,
    "attente" TEXT NOT NULL,
    "observation" TEXT NOT NULL,

    CONSTRAINT "ParcoursMedicalWiSi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParcoursMedicalTARII" (
    "id" TEXT NOT NULL,
    "suivi_orthophonique" BOOLEAN NOT NULL,
    "suivi_psychologique" BOOLEAN NOT NULL,
    "psychomotricien" BOOLEAN NOT NULL,
    "tradipracticien" BOOLEAN NOT NULL,
    "attente" TEXT NOT NULL,
    "observation" TEXT NOT NULL,

    CONSTRAINT "ParcoursMedicalTARII_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nature" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,

    CONSTRAINT "Nature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etablissement" (
    "id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,

    CONSTRAINT "Etablissement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Etablissement_libelle_key" ON "Etablissement"("libelle");

-- AddForeignKey
ALTER TABLE "Nature" ADD CONSTRAINT "Nature_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dossier" ADD CONSTRAINT "Dossier_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES "Nature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
