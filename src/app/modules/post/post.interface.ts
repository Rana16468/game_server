import { PostStatus } from "@prisma/client";

export interface PostRateMyPlateInput {
    foodname: string;
    categoryName: string;
    restaurantShopName: string;
    restaurantShopAddress: string;
    mapLocation: string;
    price: number;
    opinion: string;
    poststatus:PostStatus
  }
  
  export interface UploadedFile {
    path: string;
    filename: string;
  }

  type RateMyPlatePost = {
    id: string;
    foodname: string;
    restaurantShopName?: string;
    restaurantShopAddress?: string;
    mapLocation?: string;
    price: number;
    opinion: string;
    createdAt: string; // or Date if you want to parse it into a Date object
    updatedAt: string; // or Date if you want to parse it into a Date object
    averageRating: string; // Consider changing to `number` if needed
    photos: string[];
    total_views: number;
    recommendation_type: "interest_based" | "city_based"  | "global_trending"; // Adjust as per other possible values
    isRated: boolean;
    city: string;
  };
  
  // If dealing with an array of posts
  export type RateMyPlatePostArray = RateMyPlatePost[];