import { Module } from '@nestjs/common';
import { CheckService } from './check.service';
import { CheckController } from './check.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [CheckController],
  providers: [CheckService, PrismaService],
})
export class CheckModule {}
