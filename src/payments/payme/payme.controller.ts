import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { PaymeService } from './payme.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { PrismaService } from 'src/prisma.service';
import { ProductType } from '@prisma/client';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Payme')
@Controller('payme')
export class PaymeController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymeService: PaymeService,
  ) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        card_number: { type: 'string' },
        expire_date: { type: 'string' },
      },
    },
  })
  @Post('card')
  async createInvoice(
    @Body() body: { card_number: string; expire_date: string },
    @Request() req: any,
  ) {
    await this.paymeService.cardsCreate(
      body.card_number,
      body.expire_date,
      req.userId,
    );
    const getVerifyCode = await this.paymeService.cardGetVerifyCode(
      body.card_number,
    );
    return getVerifyCode;
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sms_code: { type: 'string' },
        card_number: { type: 'string' },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productType: { type: 'string' },
              productId: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @Post('cardOTP')
  async verifyCard(
    @Body()
    body: {
      sms_code: string;
      card_number: string;
      products: { productType: ProductType; productId: number }[];
    },
    @Request() req: any,
  ) {
    await this.paymeService.cardVerify(body.card_number, body.sms_code);

    const amount = await this.paymeService.calculatePrice(
      body.products,
      +req.userId,
    );

    const receipt = await this.paymeService.recieptsCreate(amount, req.userId);
    const pay = await this.paymeService.receiptsPay(
      body.card_number,
      receipt.result.receipt._id,
    );

    console.log('pay', pay);

    if (!pay) throw new HttpException('Payment failed', HttpStatus.BAD_REQUEST);
    if (pay.error) throw new HttpException(pay.error, HttpStatus.BAD_REQUEST);
    else {
      const payments = await this.paymeService.buyProducts(
        body.products,
        +req.userId,
        amount,
      );
      return payments;
    }
  }
}
