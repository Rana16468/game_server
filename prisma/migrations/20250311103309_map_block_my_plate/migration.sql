/*
  Warnings:

  - You are about to drop the `BlockMyPlate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlockMyPlate" DROP CONSTRAINT "BlockMyPlate_postId_fkey";

-- DropForeignKey
ALTER TABLE "BlockMyPlate" DROP CONSTRAINT "BlockMyPlate_userId_fkey";

-- DropTable
DROP TABLE "BlockMyPlate";

-- CreateTable
CREATE TABLE "blockmyplates" (
    "id" TEXT NOT NULL,
    "isBlock" BOOLEAN NOT NULL DEFAULT false,
    "valid_reason" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blockmyplates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blockmyplates_userId_key" ON "blockmyplates"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "blockmyplates_postId_key" ON "blockmyplates"("postId");

-- AddForeignKey
ALTER TABLE "blockmyplates" ADD CONSTRAINT "blockmyplates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockmyplates" ADD CONSTRAINT "blockmyplates_postId_fkey" FOREIGN KEY ("postId") REFERENCES "postratemyplates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
