import { Module } from '@nestjs/common';
import { FinancesService } from './finances.service';
import { FinancesController } from './finances.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [FinancesController],
  providers: [FinancesService, PrismaService],
})
export class FinancesModule {}
