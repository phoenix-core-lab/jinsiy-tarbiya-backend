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
import { ItemService, ItemServiceAdmin } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import {
  ApiBody,
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateItemDto } from './dto/update-item.dto';
import { AdminGuard } from 'src/admin/admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AdminGuard)
@ApiBearerAuth()
@ApiTags('Item', 'Admin')
@Controller('item')
export class ItemControllerAdmin {
  constructor(private readonly itemServiceAdmin: ItemServiceAdmin) {}

  @Post()
  @ApiOperation({ summary: 'Create new item' })
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
        subtitle: { type: 'string' },
        author: { type: 'string' },
        price: { type: 'number' },
        libraryId: { type: 'number' },
        length: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 2))
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateItemDto,
  ) {
    body.price = body.price ? +body.price : 0;
    //body.length = body.length ? +body.length : 0;
    body.libraryId = +body.libraryId;

    return this.itemServiceAdmin.createItem(files, body);
  }

  @Patch()
  @ApiOperation({ summary: 'Update item' })
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
        subtitle: { type: 'string' },
        author: { type: 'string' },
        price: { type: 'number' },
        libraryId: { type: 'number' },
        length: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 2))
  async update(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateItemDto,
  ) {
    body.price = body.price ? +body.price : 0;
    //body.length = body.length ? +body.length : 0;
    body.libraryId = +body.libraryId;
    return this.itemServiceAdmin.update(files, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete item by id' })
  remove(@Param('id') id: number) {
    return this.itemServiceAdmin.remove(+id);
  }
}

@ApiTags('Item')
@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @ApiTags('Purchase')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get bought items' })
  @Get('bought')
  async getBoughtItems(@Request() req: any) {
    return this.itemService.getBoughtItems(req.userId);
  }

  @ApiTags('Purchase')
  @Post('buy')
  @ApiOperation({ summary: 'Buy item' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        itemId: { type: 'number' },
      },
    },
  })
  async buy(
    @Request() req: any,
    @Body()
    body: { itemId: number },
  ) {
    return this.itemService.buyItem(body.itemId, req.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all items' })
  findAll() {
    return this.itemService.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get item by id' })
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(+id);
  }

  @Get('title/:title')
  @ApiOperation({ summary: 'Get item by title' })
  findLike(@Param('title') title: string) {
    return this.itemService.findLike(title);
  }
}
