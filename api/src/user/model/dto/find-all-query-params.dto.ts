import { Type } from "class-transformer";
import { IsInt } from "class-validator";

export class FindAllQueryParams{
    @IsInt()
    @Type(() => Number)
    page: number = 1;
  
    @IsInt()
    @Type(() => Number)
    limit: number = 10;
  }