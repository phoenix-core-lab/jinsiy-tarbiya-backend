import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  UploadedFiles,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from 'src/admin/admin.guard';

@ApiTags('Lessons', 'Admin')
@UseGuards(AdminGuard)
@ApiBearerAuth()
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        title: { type: 'string' },
        time: { type: 'string' },
        price: { type: 'number' },
        moduleId: { type: 'number' },
      },
    },
  })
  @Post()
  @ApiOperation({ summary: 'Create new lesson' })
  @UseInterceptors(FilesInterceptor('files'))
  async addLesson(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateLessonDto,
  ) {
    body.price = +body.price;

    body.moduleId = +body.moduleId;
    console.log(body);
    // from string to number type '1,2,3` to [1,2,3]
    //split(',') - first convert string to array
    //map(Number) - convert string to number
    return this.lessonsService.create(files, body);
  }
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        id: { type: 'number' },
        title: { type: 'string' },
        time: { type: 'string' },
        price: { type: 'number' },
        moduleId: { type: 'number' },
      },
    },
  })
  @Patch()
  @ApiOperation({ summary: 'Update lesson' })
  @UseInterceptors(FilesInterceptor('files'))
  updateLesson(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateLessonDto,
  ) {
    body.price = +body.price;

    body.id = +body.id;
    body.moduleId = +body.moduleId;
    // from string to number type '1,2,3` to [1,2,3]
    //split(',') - first convert string to array
    //map(Number) - convert string to number
    return this.lessonsService.update(files, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lesson by id' })
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(+id);
  }

  @Get('module/:id')
  @ApiOperation({ summary: 'Get lessons by module id' })
  findByModuleId(@Param('id') id: string) {
    return this.lessonsService.findByModuleId(+id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by id' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(+id);
  }
  @Get()
  @ApiOperation({ summary: 'Get all lessons' })
  findAll() {
    return this.lessonsService.findAll();
  }
}
