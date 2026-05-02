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
  
  export interface User {
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
    searchTerm:string | undefined
    country: string;
    ipaddress: string;
    visitcount: number;
    os: string;
    browser: string;
    device: string;
    userId?: string;
    user?: User;
    createdAt: Date;
    updatedAt: Date;
  }
  