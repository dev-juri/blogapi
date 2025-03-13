import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetUsersParamDto {
    @ApiPropertyOptional({
        description: "Get user with a specific id",
        example: 1234
    })
    @IsOptional()
    @IsInt()
    @Type(()=> Number)
    id?: number;
}