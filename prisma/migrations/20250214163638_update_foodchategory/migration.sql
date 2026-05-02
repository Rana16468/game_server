/*
  Warnings:

  - A unique constraint covering the columns `[categorieName]` on the table `foodcategorys` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,categorieName]` on the table `foodcategorys` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "foodcategorys_categorieName_key" ON "foodcategorys"("categorieName");

-- CreateIndex
CREATE UNIQUE INDEX "foodcategorys_userId_categorieName_key" ON "foodcategorys"("userId", "categorieName");
