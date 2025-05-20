import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaService } from 'src/prisma.service';
import { ClickController } from './click/click.controller';
import { ClickService } from './click/click.service';
import { PaymeController } from './payme/payme.controller';
import { PaymeService } from './payme/payme.service';

@Module({
  controllers: [PaymentsController, ClickController, PaymeController],
  providers: [PaymentsService, ClickService, PaymeService, PrismaService],
})
export class PaymentsModule {}
