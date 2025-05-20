import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getTest(): string {
    return this.appService.getTest();
  }
}

// @Post('')
// async post(@Request() req: any) {
//   console.log(req.body);
//   console.log(req);
//   return {
//     click_trans_id: req.body.click_trans_id,
//     merchant_trans_id: req.body.merchant_trans_id,
//     merchant_prepare_id: 1,
//     error: 0,
//     error_message: 'Success',
//   };
// }
