import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { PaymeService } from './payme.service';
import { PaymentsController } from '../payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [PrismaService, PaymeService],
})
export class PaymeModule {}
