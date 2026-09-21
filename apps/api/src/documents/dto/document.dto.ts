import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

const annotationTypes = [
  'highlight',
  'underline',
  'text',
  'drawing',
  'note',
  'bookmark',
] as const;

export class CreateDocumentDto {
  @IsString()
  @Length(1, 240)
  title: string;

  @IsString()
  @Length(1, 300)
  originalFilename: string;

  @IsString()
  @Length(1, 500)
  storagePath: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sizeBytes: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageCount?: number;
}

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lastOpenedPage?: number;
}

export class DocumentParamsDto {
  @IsUUID()
  documentId: string;
}

export class CreateAnnotationDto {
  @IsIn(annotationTypes)
  annotationType: (typeof annotationTypes)[number];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsObject()
  geometry?: Record<string, unknown>;
}

export class AnnotationParamsDto extends DocumentParamsDto {
  @IsUUID()
  annotationId: string;
}
