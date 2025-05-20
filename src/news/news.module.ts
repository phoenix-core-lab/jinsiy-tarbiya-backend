import { Module } from '@nestjs/common';
import { NewsService, NewsServiceAdmin } from './news.service';
import { NewsController, NewsControllerAdmin } from './news.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [NewsController, NewsControllerAdmin],
  providers: [NewsService, NewsServiceAdmin, PrismaService],
})
export class NewsModule {}
