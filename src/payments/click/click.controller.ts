import {
  Controller,
  Request,
  Body,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ClickService } from './click.service';
import { ProductType } from '@prisma/client';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Click')
@Controller('click')
export class ClickController {
  constructor(
    private readonly clickService: ClickService,
    private readonly prisma: PrismaService,
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
  async buyWithCard(
    @Body() body: { card_number: string; expire_date: string },
    @Request() req: any,
  ) {
    const cardToken = await this.clickService.createCardToken(
      body.card_number,
      body.expire_date,
      req.userId,
    );

    return cardToken;
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
  async buyWithCardOTP(
    @Body()
    body: {
      sms_code: string;
      card_number: string;
      products: { productType: ProductType; productId: number }[];
    },
    @Request() req: any,
  ) {
    await this.clickService.confirmCardToken(body.card_number, +body.sms_code);

    const amount = await this.clickService.calculatePrice(
      body.products,
      req.userId,
    );

    const pay = await this.clickService.payWithCardToken(
      body.card_number,
      amount,
      req.userId,
    );

    if (!pay) {
      throw new HttpException('Payment failed', HttpStatus.BAD_REQUEST);
    }
    console.log('pay', pay);
    console.log('pay.error', pay.error);
    console.log('true or false :', pay.error == true);

    if (pay.error_code) {
      throw new HttpException(pay.message, HttpStatus.BAD_REQUEST);
    } else {
      {
        const payments = await this.clickService.buyProducts(
          body.products,
          +req.userId,
          amount,
        );
        return payments;
      }
    }
  }
}
