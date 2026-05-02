export const monitoringSearchableFields: string[] = [
  "country",
  "ipaddress",
  "os",
  "browser",
  "device",
];

export const monitoringFilterableFields: string[] = [
  "searchTerm",
  "country",
  "ipaddress",
  "os",
  "browser",
  "device",
  "timePeriod", 
];
export type TimePeriod = "daily" | "weekly" | "monthly" | "yearly";

export const TimePeriodList:string[]=["daily", "weekly", "monthly", "yearly"];
export const FilterList:string[]=['page', 'limit', 'sortBy', 'orderBy'];