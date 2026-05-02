/*
  Warnings:

  - You are about to drop the column `view` on the `postratemyplates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "postratemyplates" DROP COLUMN "view";

-- AlterTable
ALTER TABLE "ratings" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "views" (
    "id" TEXT NOT NULL,
    "view" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "views_userId_postId_key" ON "views"("userId", "postId");

-- AddForeignKey
ALTER TABLE "views" ADD CONSTRAINT "views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "views" ADD CONSTRAINT "views_postId_fkey" FOREIGN KEY ("postId") REFERENCES "postratemyplates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
