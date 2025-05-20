/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import * as mm from 'music-metadata';
import { PDFDocument } from 'pdf-lib';
const { videoDuration } = require('@numairawan/video-duration');
import { promises as fsPromises } from 'fs';
import { UpdateItemDto } from './dto/update-item.dto';
import saveFile from 'src/functions';

@Injectable()
export class ItemService {
  constructor(public readonly prisma: PrismaService) {}

  async getBoughtItems(userId: number) {
    return await this.prisma.purchases.findMany({
      where: { userId: userId },
      select: {
        item: {
          select: {
            id: true,
            title: true,
            subtitle: true,
            author: true,
            price: true,
            length: true,
            libraryId: true,
            type: true,
            photoUrl: true,
            fileUrl: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async buyItem(itemId: number, userId: number) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (user.balls < item.price) {
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
    }
    const findPurchase = await this.prisma.purchases.findFirst({
      where: { userId: userId, itemId: itemId },
    });
    if (findPurchase) {
      throw new HttpException('Item already purchased', HttpStatus.BAD_REQUEST);
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { balls: user.balls - item.price },
    });
    const purchase = await this.prisma.purchases.create({
      data: {
        userId: userId,
        itemId: itemId,
      },
    });
    return purchase;
  }

  async findAll() {
    const items = await this.prisma.item.findMany();
    return items;
  }
  async findOne(id: number) {
    return await this.prisma.item.findUnique({
      where: { id: id },
    });
  }

  async findLike(title: string) {
    return await this.prisma.item.findMany({
      where: {
        title: {
          contains: title,
          mode: 'insensitive',
        },
      },

      orderBy: {
        title: 'asc',
      },

      select: {
        id: true,
        title: true,
        subtitle: true,
        author: true,
        price: true,
        length: true,
        libraryId: true,
        type: true,
        photoUrl: true,
      },
    });
  }
}

export class ItemServiceAdmin extends ItemService {
  async createItem(files: Express.Multer.File[], body: CreateItemDto) {
    // coverImage
    const coverImage = files[0];
    const imagePath = await saveFile(coverImage);

    const file = files[1];
    const filePath = await saveFile(file);
    const type = file.originalname.split('.').pop();
    if (body.length) {
      return await this.prisma.item.create({
        data: {
          photoUrl: imagePath,
          fileUrl: filePath,
          type: type,
          ...body,
        },
      });
    } else {
      if (type === 'pdf') {
        const pdfBytes = await fsPromises.readFile(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const numPages = pdfDoc.getPageCount();
        body.length = `${numPages} страниц`;
      } else if (type === 'mp3') {
        const metadata = await mm.parseFile(filePath);
        const durationInSeconds = metadata.format.duration;
        body.length = `${durationInSeconds} cекунд`;
      } else if (type === 'MP4') {
        const duration = await videoDuration(filePath);
        body.length = `${duration.seconds} cекунд`;
      } else {
        body.length = '0';
      }
      return await this.prisma.item.create({
        data: {
          photoUrl: imagePath,
          fileUrl: filePath,
          type: type,
          ...body,
        },
      });
    }
  }

  async update(files: Express.Multer.File[], body: UpdateItemDto) {
    if (files.length === 0) {
      return await this.prisma.item.update({
        where: { id: +body.id },
        data: body,
      });
    } else if (files.length === 1) {
      // throw error
      throw new HttpException(
        'Please upload both files or no files at all.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const coverImage = files[0];
    const imagePath = await saveFile(coverImage);

    const file = files[1];
    const filePath = await saveFile(file);

    const type = file.originalname.split('.').pop();
    if (body.length) {
      return await this.prisma.item.update({
        where: { id: body.id },
        data: {
          photoUrl: imagePath,
          fileUrl: filePath,
          type: type,
          ...body,
        },
      });
    } else {
      if (type === 'pdf') {
        const pdfBytes = await fsPromises.readFile(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const numPages = pdfDoc.getPageCount();
        body.length = `${numPages} страниц`;
      } else if (type === 'mp3') {
        const metadata = await mm.parseFile(filePath);
        const durationInSeconds = metadata.format.duration;
        body.length = `${durationInSeconds} cекунд`;
      } else if (type === 'MP4') {
        const duration = await videoDuration(filePath);
        body.length = `${duration.seconds} cекунд`;
      } else {
        body.length = `0`;
      }
      return await this.prisma.item.update({
        where: { id: +body.id },
        data: {
          photoUrl: imagePath,
          fileUrl: filePath,
          type: type,
          ...body,
        },
      });
    }
  }

  async remove(id: number) {
    try {
      const deletedItem = await this.prisma.item.delete({
        where: { id: id },
      });
      return deletedItem;
    } catch (error) {
      throw new HttpException(
        'Failed to delete item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
