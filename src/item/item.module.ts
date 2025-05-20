import { Module } from '@nestjs/common';
import { ItemService, ItemServiceAdmin } from './item.service';
import { ItemController, ItemControllerAdmin } from './item.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ItemController, ItemControllerAdmin],
  providers: [ItemService, ItemServiceAdmin, PrismaService],
})
export class ItemModule {}
