import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { ClickController } from './click.controller';
import { ClickService } from './click.service';

@Module({
  controllers: [ClickController],
  providers: [ClickService, PrismaService],
})
export class ClickModule {}
