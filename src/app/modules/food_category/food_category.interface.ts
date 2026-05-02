export enum UserStatus {
    ACTIVE = "ACTIVE",
    BLOCK = "BLOCK",
    DELETED = "DELETED",
  }
  
  export enum UserRole {
    USER = "USER",
    EMPLOYEE = "EMPLOYEE",
    ADMIN = "ADMIN",
  }
  
  export interface TUserFilterRequest {
    searchTerm:string | undefined
    id: string;
    username: string;
    email: string;
    password: string;
    ipaddress: string;
    phonenumber: string;
    role: UserRole;
    photo?: string;
    isVerified: boolean;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    Monitoring?: TFootCategoryFilterRequest[];
  }
  
  export interface TFootCategoryFilterRequest {
    userId?: string;
    searchTerm:string;
    categorieName:string;
    user?:  TUserFilterRequest;
    createdAt: Date;
    updatedAt: Date;

  }
  