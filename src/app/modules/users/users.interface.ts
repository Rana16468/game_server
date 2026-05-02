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
    Monitoring?: TMonitoringFilterRequest[];
  }
  
  export interface TMonitoringFilterRequest {
    country: string;
    ipaddress: string;
    visitcount: number;
    os: string;
    browser: string;
    device: string;
    userId?: string;
    user?:  TUserFilterRequest;
    createdAt: Date;
    updatedAt: Date;
  }
  