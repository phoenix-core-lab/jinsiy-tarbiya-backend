import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CheckService } from './check.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
@ApiTags('Check')
@Controller('check')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CheckController {
  constructor(private readonly checkService: CheckService) {}
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        questions: { type: 'array', items: { type: 'number' } },
        answers: { type: 'array', items: { type: 'number' } },
      },
    },
  })
  @Post()
  create(
    @Request() req: any,
    @Body() body: { questions: number[]; answers: number[] },
  ) {
    return this.checkService.check(body.questions, body.answers, req.userId);
  }
}
