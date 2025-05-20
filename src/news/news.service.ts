import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { PrismaService } from 'src/prisma.service';
import { promises as fsPromises } from 'fs';
import saveFile from 'src/functions';

@Injectable()
export class NewsService {
  constructor(public readonly prisma: PrismaService) {}

  async findAll() {
    const news = await this.prisma.news.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return news;
  }

  async findOne(id: number) {
    try {
      const getNews = await this.prisma.news.findUnique({
        where: { id: id },
      });
      return getNews;
    } catch (error) {
      throw new HttpException(
        'Failed to find news',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export class NewsServiceAdmin extends NewsService {
  async addNews(file: Express.Multer.File, body: CreateNewsDto) {
    try {
      const filePath = await saveFile(file);

      return await this.prisma.news.create({
        data: {
          photoUrl: filePath,
          ...body,
        },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.FORBIDDEN);
    }
  }

  async update(file: Express.Multer.File, body: UpdateNewsDto) {
    try {
      if (!file) {
        const updateNews = await this.prisma.news.update({
          where: { id: +body.id },
          data: {
            title: body.title,
            description: body.description,
            mainUrl: body.mainUrl,
          },
        });
        return updateNews;
      }
      const filePath = await saveFile(file);
      const updateNews = await this.prisma.news.update({
        where: { id: +body.id },
        data: {
          photoUrl: filePath,
          title: body.title,
          description: body.description,
          mainUrl: body.mainUrl,
        },
      });

      return updateNews;
    } catch (error) {
      throw new HttpException(
        'Failed to update news',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async remove(id: number) {
    try {
      const news = await this.prisma.news.delete({
        where: { id: id },
      });

      return news;
    } catch (error) {
      throw new HttpException(
        'Failed to delete news',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
