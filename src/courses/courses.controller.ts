import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CoursesService, CoursesServiceAdmin } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AdminGuard } from 'src/admin/admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AdminGuard)
@ApiBearerAuth()
@ApiTags('Courses', 'Admin')
@Controller('courses')
export class CoursesControllerAdmin {
  constructor(private readonly coursesServiceAdmin: CoursesServiceAdmin) {}
  @Post()
  @ApiOperation({ summary: 'Create new course' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Array of files to upload',
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
        description: { type: 'string' },
        author: { type: 'string' },
        time: { type: 'string' },
        price: { type: 'number' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateCourseDto,
  ) {
    body.price = +body.price;
    return this.coursesServiceAdmin.create(files, body);
  }
  @Patch()
  @ApiOperation({ summary: 'Update course' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Array of files to upload',
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
        description: { type: 'string' },
        author: { type: 'string' },
        time: { type: 'string' },
        price: { type: 'number' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateCourseDto,
  ) {
    body.id = +body.id;
    body.price = +body.price;
    return this.coursesServiceAdmin.update(files, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course' })
  remove(@Param('id') id: number) {
    return this.coursesServiceAdmin.remove(+id);
  }
}

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}
  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  findAll() {
    return this.coursesService.findAll();
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('/forUser')
  @ApiOperation({ summary: 'Get all courses for user' })
  findAllUnique(@Request() req: any) {
    return this.coursesService.findAllUnique(+req.userId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('forUser/:id')
  @ApiOperation({ summary: 'Get course by id' })
  findOneUnique(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.findOneUnique(+id, req.userId);
  }

  @Get('one/:id')
  @ApiOperation({ summary: 'Get course by id' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('bought')
  @ApiOperation({ summary: 'Get course by id' })
  findBought(@Request() req: any) {
    return this.coursesService.findBought(req.userId);
  }
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('bought/:id')
  @ApiOperation({ summary: 'Get course by id' })
  findOneBought(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.findOneBought(+id, req.userId);
  }
}
