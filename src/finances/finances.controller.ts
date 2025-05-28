import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FinancesService } from './finances.service';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from 'src/admin/admin.guard';
import { PaymentType } from '@prisma/client';
@ApiTags('Finances')
@UseGuards(AdminGuard)
@ApiBearerAuth()
@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @ApiOperation({
    summary: 'Get all payments with optional filters and pagination',
  })
  @ApiQuery({
    name: 'from_date',
    required: false,
    type: String,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'until',
    required: false,
    type: String,
    example: '2025-12-31',
  })
  @ApiQuery({
    name: 'paymentType',
    required: false,
    enum: ['payme', 'click', 'uzum'],
    example: 'payme',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'List of filtered payments returned successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid payment type' })
  @Get('allPaymentsWithFilter')
  async getPayments(
    @Query('from_date') fromDate?: string,
    @Query('until') until?: string,
    @Query('paymentType') paymentType?: string,
    @Query('take') take = 10,
    @Query('skip') skip = 0,
  ) {
    const from = fromDate ? new Date(fromDate) : null;
    const to = until ? new Date(until) : null;

    const validPaymentTypes: PaymentType[] = ['payme', 'click', 'uzum'];

    let type: PaymentType | null = null;
    if (paymentType) {
      if (!validPaymentTypes.includes(paymentType as PaymentType)) {
        throw new BadRequestException(
          `Недопустимый тип оплаты. Допустимые значения: ${validPaymentTypes.join(', ')}`,
        );
      }
      type = paymentType as PaymentType;
    }

    return await this.financesService.getPayments(from, to, type, +take, +skip);
  }

  @Get('sum')
  @ApiOperation({ summary: 'Get total sum of payments' })
  @ApiResponse({
    status: 200,
    description: 'Sum of payments returned successfully',
  })
  @ApiQuery({
    name: 'from_date',
    required: false,
    example: '2025-01-01',
    type: String,
    description: 'Start date in ISO format',
  })
  @ApiQuery({
    name: 'until',
    required: false,
    example: '2025-12-01',
    type: String,
    description: 'End date in ISO format',
  })
  @ApiQuery({
    name: 'paymentType',
    required: false,
    enum: PaymentType,
    description: 'Type of payment',
  })
  async getSumOfPayments(
    @Query('from_date') from_date: string,
    @Query('until') until: string,
    @Query('paymentType') paymentType: PaymentType,
  ) {
    return this.financesService.getSumOfPayments(
      from_date ? new Date(from_date) : null,
      until ? new Date(until) : null,
      paymentType || null,
    );
  }

  @Get('filter')
  @ApiOperation({ summary: 'Фильтрация платежей по имени и номеру телефона' })
  @ApiResponse({
    status: 200,
    description: 'Список платежей, соответствующих фильтру',
  })
  @ApiQuery({
    name: 'fullName',
    required: false,
    type: String,
    description: 'ФИО пользователя',
  })
  @ApiQuery({
    name: 'phoneNumber',
    required: false,
    type: String,
    description: 'Номер телефона пользователя',
  })
  async filterPayments(
    @Query('fullName') fullName?: string,
    @Query('phoneNumber') phoneNumber?: string,
  ) {
    return this.financesService.filterPayments(
      fullName || '',
      phoneNumber || '',
    );
  }
}
