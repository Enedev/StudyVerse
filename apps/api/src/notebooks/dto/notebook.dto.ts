import { PartialType } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';

const paperTypes = ['blank', 'lined', 'grid', 'dotted'] as const;

export class CreateNotebookDto {
  @IsString()
  @Length(1, 240)
  title: string;

  @IsOptional()
  @IsIn(paperTypes)
  paperType?: (typeof paperTypes)[number];
}

export class UpdateNotebookDto extends PartialType(CreateNotebookDto) {
  @IsOptional()
  @IsArray()
  pages?: Record<string, unknown>[];
}

export class NotebookParamsDto {
  @IsUUID()
  notebookId: string;
}
