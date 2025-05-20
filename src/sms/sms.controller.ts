import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SmsService } from './sms.service';
import { CreateSmsDto } from './dto/create-sms.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/admin/admin.guard';

@ApiTags('Sms')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        surname: { type: 'string' },
        phoneNumber: { type: 'string' },
        sms: { type: 'string' },
      },
    },
  })
  @Post()
  @ApiOperation ({ summary: 'Register new sms' })
  async registerUser(
    @Body()
    body: CreateSmsDto,
  ) {
    return this.smsService.create(body);
  }

  @ApiTags('Admin')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all sms' })
  findAll() {
    return this.smsService.findAll();
  }

  @ApiTags('Admin', 'Finances')
  @Get('count')
  @ApiOperation({ summary: 'Get sms count' })
  count() {
    return this.smsService.count();
  }
}
