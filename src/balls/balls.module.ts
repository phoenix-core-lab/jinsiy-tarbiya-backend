import { Module } from '@nestjs/common';
import { BallsService } from './balls.service';
import { BallsController } from './balls.controller';

@Module({
  controllers: [BallsController],
  providers: [BallsService],
})
export class BallsModule {}
