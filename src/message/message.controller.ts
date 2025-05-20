import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MentorGuard } from 'src/mentor/mentor.guard';

@ApiTags('Message')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
  @ApiTags('Mentor')
  @UseGuards(MentorGuard)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
      },
    },
  })
  @Post()
  @ApiOperation ({ summary: 'Add new message' })
  async addNews(
    @Body()
    body: CreateMessageDto,
  ) {
    return this.messageService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all messages' })
  findAll() {
    return this.messageService.findAll();
  }
}
