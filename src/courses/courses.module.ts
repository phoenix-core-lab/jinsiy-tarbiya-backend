import { Module } from '@nestjs/common';
import { CoursesService, CoursesServiceAdmin } from './courses.service';
import {
  CoursesController,
  CoursesControllerAdmin,
} from './courses.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [CoursesController, CoursesControllerAdmin],
  providers: [CoursesService, CoursesServiceAdmin, PrismaService],
})
export class CoursesModule {}
