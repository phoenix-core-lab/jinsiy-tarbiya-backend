import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/admin/admin.guard';

@UseGuards(AdminGuard)
@ApiBearerAuth()
@ApiTags('Questions', 'Admin')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        answers: { type: 'array', items: { type: 'string' } },
        correctAnswer: { type: 'number' },
        lessonId: { type: 'number' },
      },
    },
  })
  @Post()
  @ApiOperation({ summary: 'Create new question' })
  create(@Body() body: CreateQuestionDto) {
    return this.questionsService.create(body);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        answers: { type: 'array', items: { type: 'string' } },
        correctAnswer: { type: 'number' },
        lessonId: { type: 'number' },
      },
    },
  })
  @Patch()
  @ApiOperation({ summary: 'Update question' })
  update(@Body() body: UpdateQuestionDto) {
    return this.questionsService.update(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all questions' })
  findAll() {
    return this.questionsService.findAll();
  }

  @Get('byQuestionId/:id')
  @ApiOperation({ summary: 'Get question by id' })
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(+id);
  }

  @Get('byLessonId/:id')
  @ApiOperation({ summary: 'Get question by id' })
  findByLessonId(@Param('id') id: string) {
    return this.questionsService.findByLessonId(+id);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete question by id' })
  remove(@Param('id') id: string) {
    return this.questionsService.remove(+id);
  }
}
