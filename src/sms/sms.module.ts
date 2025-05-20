import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [SmsController],
  providers: [SmsService, PrismaService],
})
export class SmsModule {}
