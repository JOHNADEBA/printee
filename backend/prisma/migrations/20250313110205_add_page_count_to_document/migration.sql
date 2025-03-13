/*
  Warnings:

  - Added the required column `pageCount` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "isPrinted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pageCount" INTEGER NOT NULL;
