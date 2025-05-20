import { Injectable } from '@nestjs/common';
import { CreateSmsDto } from './dto/create-sms.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SmsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateSmsDto) {
    const sms = await this.prisma.sms.create({
      data: {
        ...body,
      },
    });
    return sms;
  }

  async findAll() {
    const sms = await this.prisma.sms.findMany();
    return sms;
  }

  async count() {
    const sms = await this.prisma.sms.count();
    return sms;
  }
}
