import {
  IsEmail,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateWhiteboardDto {
  @IsString()
  @Length(1, 240)
  title: string;
}

export class UpdateWhiteboardDto {
  @IsOptional()
  @IsString()
  @Length(1, 240)
  title?: string;

  @IsOptional()
  @IsObject()
  snapshot?: Record<string, unknown>;
}

export class WhiteboardParamsDto {
  @IsUUID()
  whiteboardId: string;
}

export class InviteWhiteboardMemberDto {
  @IsEmail()
  email: string;

  @IsIn(['viewer', 'editor'])
  role: 'viewer' | 'editor';
}

export class WhiteboardMemberParamsDto extends WhiteboardParamsDto {
  @IsUUID()
  memberId: string;
}
