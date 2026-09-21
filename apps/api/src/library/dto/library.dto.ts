import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @Length(1, 240)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  author?: string;

  @IsOptional()
  @IsUUID()
  documentId?: string;

  @IsOptional()
  @IsString()
  coverPath?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  categories?: string[];
}

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  readingProgress?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lastOpenedPage?: number;
}

export class ListBooksQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;
}

export class BookParamsDto {
  @IsUUID()
  bookId: string;
}
