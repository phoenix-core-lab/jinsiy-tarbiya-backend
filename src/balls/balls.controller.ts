import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BallsService } from './balls.service';
import { CreateBallDto } from './dto/create-ball.dto';
import { UpdateBallDto } from './dto/update-ball.dto';

@Controller('balls')
export class BallsController {
  constructor(private readonly ballsService: BallsService) {}

  @Post()
  create(@Body() createBallDto: CreateBallDto) {
    return this.ballsService.create(createBallDto);
  }

  @Get()
  findAll() {
    return this.ballsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ballsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBallDto: UpdateBallDto) {
    return this.ballsService.update(+id, updateBallDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ballsService.remove(+id);
  }
}
