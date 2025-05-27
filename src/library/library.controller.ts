import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { LibraryService, LibraryServiceAdmin } from './library.service';
import { CreateLibraryDto } from './dto/create-library.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/admin/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateLibraryDto } from './dto/update-library.dto';

@UseGuards(AdminGuard)
@ApiBearerAuth()
@ApiTags('Library', 'Admin')
@Controller('library')
export class LibraryControllerAdmin {
  constructor(private readonly libraryServiceAdmin: LibraryServiceAdmin) {}
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: { type: 'string' },
      },
    },
  })
  @Post()
  @ApiOperation({ summary: 'Create new library' })
  @UseInterceptors(FileInterceptor('file'))
  createLibrary(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateLibraryDto,
  ) {
    return this.libraryServiceAdmin.create(file, body);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        id: { type: 'number' },
        name: { type: 'string' },
      },
    },
  })
  @Patch()
  @ApiOperation({ summary: 'Update library' })
  @UseInterceptors(FileInterceptor('file'))
  updateLibrary(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateLibraryDto,
  ) {
    body.id = +body.id;
    return this.libraryServiceAdmin.update(file, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove library by id' })
  removeLibrary(@Param('id') id: number) {
    return this.libraryServiceAdmin.remove(+id);
  }
}
@ApiTags('Library')
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('/')
  @ApiOperation({ summary: 'Get all libraries' })
  async findAll() {
    return this.libraryService.findAll();
  }

  @Get('withItems')
  @ApiOperation({ summary: 'Get all libraries with items' })
  async findAllWithItems() {
    return this.libraryService.findAllWithItems();
  }
}
