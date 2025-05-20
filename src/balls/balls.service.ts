import { Injectable } from '@nestjs/common';
import { CreateBallDto } from './dto/create-ball.dto';
import { UpdateBallDto } from './dto/update-ball.dto';

@Injectable()
export class BallsService {
  create(createBallDto: CreateBallDto) {
    return 'This action adds a new ball';
  }

  findAll() {
    return `This action returns all balls`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ball`;
  }

  update(id: number, updateBallDto: UpdateBallDto) {
    return `This action updates a #${id} ball`;
  }

  remove(id: number) {
    return `This action removes a #${id} ball`;
  }
}
