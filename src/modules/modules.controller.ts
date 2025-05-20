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
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/admin/admin.guard';

@UseGuards(AdminGuard)
@ApiBearerAuth()
@ApiTags('Modules', 'Admin')
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        time: { type: 'string' },
        price: { type: 'number' },
        courseId: { type: 'number' },
      },
    },
  })
  @Post()
  @ApiOperation({ summary: 'Create new module' })
  create(@Body() createModuleDto: CreateModuleDto) {
    createModuleDto.price = +createModuleDto.price;

    return this.modulesService.create(createModuleDto);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        time: { type: 'string' },
        price: { type: 'number' },
        courseId: { type: 'number' },
      },
    },
  })
  @Patch(':id')
  @ApiOperation({ summary: 'Update module' })
  update(@Param('id') id: string, @Body() body: UpdateModuleDto) {
    body.price = +body.price;

    return this.modulesService.update(+id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete module' })
  remove(@Param('id') id: number) {
    return this.modulesService.remove(+id);
  }

  @Get('byCourse/:id')
  @ApiOperation({ summary: 'Get all modules by course id' })
  findByCourseId(@Param('id') id: number) {
    return this.modulesService.findByCourseId(+id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get module by id' })
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(+id);
  }

  @Get('')
  @ApiOperation({ summary: 'Get all modules' })
  findAll() {
    return this.modulesService.findAll();
  }
}
