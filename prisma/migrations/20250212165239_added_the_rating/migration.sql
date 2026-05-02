/*
  Warnings:

  - You are about to drop the column `rating` on the `postratemyplates` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "postratemyplates" DROP COLUMN "rating",
ADD COLUMN     "poststatus" "PostStatus" NOT NULL DEFAULT 'PRIVATE';

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "isRating" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ratings_userId_key" ON "ratings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_postId_key" ON "ratings"("postId");

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_postId_fkey" FOREIGN KEY ("postId") REFERENCES "postratemyplates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
