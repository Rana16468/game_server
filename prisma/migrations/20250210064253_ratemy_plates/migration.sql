-- CreateTable
CREATE TABLE "foodcategorys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categorieName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foodcategorys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postratemyplates" (
    "id" TEXT NOT NULL,
    "foodname" TEXT NOT NULL,
    "categorieId" TEXT NOT NULL,
    "restaurantShopName" TEXT,
    "restaurantShopAddress" TEXT,
    "mapLocation" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "view" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "opinion" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postratemyplates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" SERIAL NOT NULL,
    "postId" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "foodcategorys" ADD CONSTRAINT "foodcategorys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postratemyplates" ADD CONSTRAINT "postratemyplates_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "foodcategorys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_postId_fkey" FOREIGN KEY ("postId") REFERENCES "postratemyplates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
