import { PartialType } from '@nestjs/swagger';
import { CreateBallDto } from './create-ball.dto';

export class UpdateBallDto extends PartialType(CreateBallDto) {}
