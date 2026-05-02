-- CreateTable
CREATE TABLE "BlockMyPlate" (
    "id" TEXT NOT NULL,
    "isBlock" BOOLEAN NOT NULL DEFAULT false,
    "valid_reason" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockMyPlate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlockMyPlate_userId_key" ON "BlockMyPlate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockMyPlate_postId_key" ON "BlockMyPlate"("postId");

-- AddForeignKey
ALTER TABLE "BlockMyPlate" ADD CONSTRAINT "BlockMyPlate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockMyPlate" ADD CONSTRAINT "BlockMyPlate_postId_fkey" FOREIGN KEY ("postId") REFERENCES "postratemyplates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
