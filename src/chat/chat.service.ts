import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
      },
    });
    const chat = await this.prisma.chat.findMany();

    // join messages by user_id without duplicates
    const answer = users.map((user) => {
      const messages = chat.filter((msg) => msg.userId === user.id);
      return { ...user, messages };
    });

    return answer;
  }

  async findById(id: number) {
    try {
      const chat = await this.prisma.chat.findMany({
        where: { userId: id },
      });

      if (!chat) {
        throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
      }
      return chat;
    } catch (error) {
      throw new HttpException(
        'An error occurred while retrieving the chat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
