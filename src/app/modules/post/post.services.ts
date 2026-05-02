import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { AppError } from "../../middleware/golobalErrorHnadelar";
import httpStatus from "http-status";
import prisma from "../../shared/prisma";
import sendImageToCloudinary from "../../../utility/Image/sendImageToCloudinary";
import { PostRateMyPlateInput, RateMyPlatePostArray, UploadedFile } from "./post.interface";
import { Rating, View } from "@prisma/client";
import sqlQuery from "../../../utility/code/sqlQuery";
import behaviorAnalysisQuery from "../../../utility/code/behaviorAnalysisQuery";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 600, checkperiod: 600 });

const CACHE_KEYS = {
  ALL_POSTS: (userId: string, page: number, limit: number) => `all_posts_${userId}_${page}_${limit}`,
  USER_BEHAVIOR: (userId: string) => `user_behavior_${userId}`,
  CATEGORY: (userId: string, categoryName: string) => `category_${userId}_${categoryName}`,
};

/**
 * Validates the required fields in the request body
 * @param data - The request body data
 * @throws AppError if validation fails
 */
const validateInput = (data: Partial<PostRateMyPlateInput>): void => {
  const requiredFields = [
    "foodname",
    "categoryName",
    "restaurantShopName",
    "restaurantShopAddress",
    "price",
    "poststatus",
  ];

  const missingFields = requiredFields.filter(
    (field) => !data[field as keyof PostRateMyPlateInput]
  );

  if (missingFields.length > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Missing required fields: ${missingFields.join(", ")}`,
      ""
    );
  }

  if (isNaN(Number(data.price)) || Number(data.price) <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Price must be a valid positive number",
      ""
    );
  }
};

/**
 * Handles the creation or retrieval of a food category with caching
 * @param userId - The user's ID
 * @param categoryName - The name of the category
 * @returns The category object with id
 */
const getOrCreateCategory = async (userId: string, categoryName: string): Promise<{ id: string }> => {
  const cacheKey = CACHE_KEYS.CATEGORY(userId, categoryName);
  const cachedCategory = cache.get<{ id: string }>(cacheKey);
  
  if (cachedCategory) {
    return cachedCategory;
  }

  const existingCategory = await prisma.foodCategory.findFirst({
    where: {
      userId,
      categorieName: categoryName,
    },
    select: {
      id: true,
    },
  });

  if (existingCategory) {
    cache.set(cacheKey, existingCategory);
    return existingCategory;
  }

  const newCategory = await prisma.foodCategory.create({
    data: {
      userId,
      categorieName: categoryName,
    },
    select:{
      id:true
    }
  });
  
  const categoryWithId = { id: newCategory.id };
  cache.set(cacheKey, categoryWithId);
  return categoryWithId;
};

/**
 * Uploads multiple images to Cloudinary concurrently
 * @param files - Array of uploaded files
 * @returns Array of secure URLs
 */
const uploadImages = async (files: UploadedFile[]): Promise<string[]> => {
  try {
    return await Promise.all(
      files.map(async (file) => {
        const { secure_url } = (await sendImageToCloudinary(
          file.filename,
          file.path
        )) as { secure_url: string };
        return secure_url;
      })
    );
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to upload images",
      error
    );
  }
};

/**
 * Invalidates relevant caches after data modifications
 * @param userId - The user's ID
 */
const invalidateUserCaches = (userId: string): void => {
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.includes(`_${userId}_`)) {
      cache.del(key);
    }
  });
  cache.del(CACHE_KEYS.USER_BEHAVIOR(userId));
};

/**
 * Creates a new rate-my-plate post with associated images
 * @param req - Express request object
 * @param user - JWT payload containing user information
 * @returns Created post object
 */
const createRateMyPlatePost = async (req: Request, user: JwtPayload) => {
  const files = req.files as UploadedFile[];
  const data = req.body as PostRateMyPlateInput;

  try {
    if (!files?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "At least one image is required",
        ""
      );
    }
    validateInput(data);

    const imageUploadPromise = uploadImages(files);

    const result = await prisma.$transaction(async (tx) => {
      const category = await getOrCreateCategory(user.id, data.categoryName);

      const post = await tx.postRateMyPlate.create({
        data: {
          foodname: data.foodname,
          restaurantShopName: data.restaurantShopName,
          restaurantShopAddress: data.restaurantShopAddress,
          mapLocation: data.mapLocation || "",
          price: Number(data.price),
          opinion: data.opinion || "",
          poststatus: data.poststatus,
          categorieId: category.id,
        },
      });

      // Wait for image upload to complete
      const imageUrls = await imageUploadPromise;
      
      await tx.photo.createMany({
        data: imageUrls.map((url) => ({
          postId: post.id,
          photo: url,
        })),
      });
      
      return post;
    });

    // Invalidate user caches after creating a new post
    invalidateUserCaches(user.id);

    return {
      message: "Post successfully created!",
      post: result,
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error creating post",
      error
    );
  }
};

/**
 * Retrieves all rate-my-plate posts for a user with caching
 * @param userId - The user's ID
 * @param page - Page number (optional, defaults to 1)
 * @param limit - Number of posts per page (optional, defaults to 40)
 * @returns Paginated list of posts
 */
const find_all_RateMyPlatePostFromDb = async (userId: string, page = 2, limit = 40) => {
  const cacheKey = CACHE_KEYS.ALL_POSTS(userId, page, limit);
  const cachedResult = cache.get<{limit: number, page: number, total: number, result: RateMyPlatePostArray}>(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  try {
    const result = await prisma.$queryRaw<RateMyPlatePostArray>(
      sqlQuery.ratemyplateQuery(userId, limit, page)
    );
    
    const response = {
      limit,
      page,
      total: result.length,
      result,
    };
    
    // Cache the result
    cache.set(cacheKey, response);
    
    return response;
  } catch (error:any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Failed to fetch rate my plate posts",
      error
    );
  }
};

/**
 * Analyzes user behavior with caching
 * @param userId - The user's ID
 * @returns User behavior analysis data
 */
const user_Behavior_Analysis_RateMyPlatePostFromDb = async (userId: string) => {
  const cacheKey = CACHE_KEYS.USER_BEHAVIOR(userId);
  
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  // If not in cache, fetch from database
  try {
    const result = await prisma.$queryRaw(behaviorAnalysisQuery.behaviorAnalysis(userId));
    
    // Cache the result
    cache.set(cacheKey, result);
    
    return result;
  } catch (error:any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Failed to fetch user behavior analysis",
      error
    );
  }
};

/**
 * Records a rating for a post
 * @param user - JWT payload containing user information
 * @param payload - Rating data
 * @returns Rating record result
 */
const rating_recordIntoDb = async (user: JwtPayload, payload: Rating) => {
  const { postId, rating } = payload || {};

  try {
    const result = await prisma.rating.upsert({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
      update: {
        rating,
        isRating: true,
      },
      create: {
        postId: postId,
        rating: rating,
        userId: user.id,
        isRating: rating ? true : false,
      },
      select: {
        isRating: true,
      },
    });
    
    invalidateUserCaches(user.id);
    
    return result;
  } catch (error:any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Error rating record server issues",
      error
    );
  }
};

/**
 * Records a view for a post
 * @param user - JWT payload containing user information
 * @param payload - View data
 * @returns View record result
 */
const view_recordIntoDb = async (user: JwtPayload, payload: View) => {
  const { postId, view } = payload || {};

  try {
    const result = await prisma.view.upsert({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
      update: {
        view: {
          increment: view,
        },
      },
      create: {
        postId,
        view,
        userId: user.id,
      },
      select: {
        updatedAt: true,
      },
    });
    
    // For views, we don't invalidate caches as this is a frequent operation
    // and doesn't significantly affect the data being cached
    
    return result;
  } catch (error:any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Error view record server issues",
      error
    );
  }
};

/**
 * Updates a rate-my-plate post
 * @param req - Express request object
 * @param user - JWT payload containing user information
 * @param id - Post ID
 * @returns Updated post information
 */
const updateRateMyPlateIntoDb = async (
  req: Request,
  user: JwtPayload,
  id: string
) => {
  const files = req.files as UploadedFile[];
  const {
    categoryName,
    foodname,
    restaurantShopName,
    restaurantShopAddress,
    mapLocation,
    price,
    poststatus,
    opinion,
    photoIds,
  } = req.body;

  try {
    // Start image upload early if there are files to process
    let imageUploadPromise: Promise<string[]> | undefined;
    if (files.length && photoIds?.length) {
      imageUploadPromise = uploadImages(files);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedCategory = await tx.foodCategory.update({
        where: {
          userId_categorieName: {
            userId: user.id,
            categorieName: categoryName,
          },
        },
        data: {
          posts: {
            update: {
              where: { id },
              data: {
                foodname,
                restaurantShopName,
                restaurantShopAddress,
                mapLocation,
                price: Number(price),
                poststatus,
                opinion,
              },
            },
          },
        },
        select: { posts: { select: { updatedAt: true } } },
      });

      if (files.length && photoIds?.length && imageUploadPromise) {
        // Wait for image upload to complete
        const imageUrls = await imageUploadPromise;
        
        await Promise.all(
          photoIds.map((photoId: number, index: number) =>
            tx.photo.update({
              where: { id: photoId },
              data: { photo: imageUrls[index] },
              select: { updatedAt: true },
            })
          )
        );
      }
      return updatedCategory;
    });
    
    // Invalidate user caches after updating a post
    invalidateUserCaches(user.id);
    
    return result;
  } catch (error: any) {
    throw new AppError(
      error.code === "P2025"
        ? httpStatus.NOT_FOUND
        : httpStatus.SERVICE_UNAVAILABLE,
      error.code === "P2025"
        ? "Food category not found"
        : "Update rate my plate server error",
      error
    );
  }
};

/**
 * Clears all caches or specific user caches
 * @param userId - Optional user ID to clear specific user caches
 */
const clearCache = (userId?: string): void => {
  if (userId) {
    invalidateUserCaches(userId);
  } else {
    cache.flushAll();
  }
};

const RateMyPlateServices = {
  createRateMyPlatePost,
  find_all_RateMyPlatePostFromDb,
  rating_recordIntoDb,
  view_recordIntoDb,
  updateRateMyPlateIntoDb,
  user_Behavior_Analysis_RateMyPlatePostFromDb,
  clearCache
};

export default RateMyPlateServices;

// next is notification 
