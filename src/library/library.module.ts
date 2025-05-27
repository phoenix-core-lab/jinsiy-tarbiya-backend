import { Module } from '@nestjs/common';
import { LibraryService, LibraryServiceAdmin } from './library.service';
import {
  LibraryController,
  LibraryControllerAdmin,
} from './library.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [LibraryController, LibraryControllerAdmin],
  providers: [LibraryService, LibraryServiceAdmin, PrismaService],
})
export class LibraryModule {}
