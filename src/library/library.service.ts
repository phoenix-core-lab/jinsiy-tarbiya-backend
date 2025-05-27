import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLibraryDto } from './dto/create-library.dto';
import { PrismaService } from 'src/prisma.service';
import { UpdateLibraryDto } from './dto/update-library.dto';
import saveFile from 'src/functions';

@Injectable()
export class LibraryService {
  constructor(public readonly prisma: PrismaService) {}

  async findAll() {
    // include count of items in library
    const libraries: any = await this.prisma.library.findMany({
      select: {
        id: true,
        name: true,
        photoUrl: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
    });
    libraries.forEach((library) => {
      library.count = library._count.items;
      delete library._count;
    });
    return libraries;
  }

  findAllWithItems() {
    return this.prisma.library.findMany({
      include: {
        items: {
          select: {
            id: true,
            title: true,
            subtitle: true,
            photoUrl: true,
            length: true,
            author: true,
            price: true,
          },
        },
      },
    });
  }
  findOne(id: number) {
    const library: any = this.prisma.library.findUnique({
      where: { id },
    });
    library.count = this.prisma.item.count({
      where: {
        libraryId: id,
      },
    });
    return library;
  }
}

export class LibraryServiceAdmin extends LibraryService {
  async create(file: Express.Multer.File, body: CreateLibraryDto) {
    const filePath = await saveFile(file);
    const library = await this.prisma.library.create({
      data: {
        ...body,
        photoUrl: filePath,
      },
    });
    return library;
  }

  async update(file: Express.Multer.File, body: UpdateLibraryDto) {
    if (!file) {
      const library = await this.prisma.library.update({
        where: { id: +body.id },
        data: {
          name: body.name,
        },
      });
      return library;
    } else {
      const filePath = await saveFile(file);
      const library = await this.prisma.library.update({
        where: { id: +body.id },
        data: {
          name: body.name,
          photoUrl: filePath,
        },
      });

      return library;
    }
  }

  async remove(id: number) {
    // delete file
    const library = await this.prisma.library.delete({
      where: { id: +id },
    });
    try {
    } catch (error) {
      throw new HttpException(
        'Failed to delete item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return library;
  }
}
