import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FinancesService } from './finances.service';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new finance' })
  create(@Body() createFinanceDto: CreateFinanceDto) {
    return this.financesService.create(createFinanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all finances' })
  findAll() {
    return this.financesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get finance by id' })
  findOne(@Param('id') id: string) {
    return this.financesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update finance by id' })
  update(@Param('id') id: string, @Body() updateFinanceDto: UpdateFinanceDto) {
    return this.financesService.update(+id, updateFinanceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete finance by id' })
  remove(@Param('id') id: string) {
    return this.financesService.remove(+id);
  }
}
