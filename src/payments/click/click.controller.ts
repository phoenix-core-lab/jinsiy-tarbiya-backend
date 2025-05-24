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
      },
    },
  })
  @Post('cardOTP')
  async buyWithCardOTP(
    @Body()
    body: {
      sms_code: string;
      card_number: string;
    },
    @Request() req: any,
  ) {
    // await this.clickService.confirmCardToken(body.card_number, +body.sms_code);
    // const amount = await this.clickService.calculatePrice(
    //   body.products,
    //   req.userId,
    // );
    // const pay = await this.clickService.payWithCardToken(
    //   body.card_number,
    //   1000,
    //   req.userId,
    // );
    const payments = await this.clickService.buyProducts(+req.userId, 1000);
    return payments;
  }
}
