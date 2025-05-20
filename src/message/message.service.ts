import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateMessageDto) {
    const message = await this.prisma.message.create({
      data: {
        title: body.title,
        description: body.description,
      },
    });
    return message;
  }

  async findAll() {
    const message = await this.prisma.message.findMany();
    return message;
  }
}
