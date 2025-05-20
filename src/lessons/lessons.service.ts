import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from 'src/prisma.service';
import saveFile from 'src/functions';

@Injectable()
export class LessonsService {
  constructor(public readonly prisma: PrismaService) {}
  async create(files: Express.Multer.File[], body: CreateLessonDto) {
    // if file no mov or mp4 throw error
    if (
      files[0].mimetype !== 'video/quicktime' &&
      files[0].mimetype !== 'video/mp4'
    ) {
      throw new HttpException(
        'File must be of type mov or mp4',
        HttpStatus.FORBIDDEN,
      );
    }
    const filePath = await saveFile(files[0]);
    const itemsUrls: string[] = [];
    files.shift();
    // Use map to create an array of promises for each file upload operation
    const uploadPromises = files.map(async (file) => {
      const filePath = await saveFile(file);
      // Push the file path into the photoUrls array
      itemsUrls.push(filePath);
    });

    // Wait for all file upload promises to resolve
    await Promise.all(uploadPromises);

    const lesson = await this.prisma.lessons.create({
      data: {
        title: body.title,
        time: body.time,
        price: +body.price,
        moduleId: +body.moduleId,
        videoUrl: filePath,
        items: itemsUrls,
      },
    });
    return lesson;
  }
  async findAll() {
    return await this.prisma.lessons.findMany({
      orderBy: {
        title: 'asc',
      },
    });
  }

  async update(files: Express.Multer.File[], body: UpdateLessonDto) {
    try {
      if (files.length === 0) {
        const updateLesson = await this.prisma.lessons.update({
          where: { id: +body.id },
          data: {
            title: body.title,
            time: body.time,
            price: body.price,
            moduleId: body.moduleId,
          },
        });
        return updateLesson;
      } else {
        if (
          files[0].mimetype !== 'video/quicktime' &&
          files[0].mimetype !== 'video/mp4'
        ) {
          throw new HttpException(
            'File must be of type mov or mp4',
            HttpStatus.FORBIDDEN,
          );
        }
        const filePath = await saveFile(files[0]);
        files.shift();
        const itemsUrls: string[] = [];
        // Use map to create an array of promises for each file upload operation
        const uploadPromises = files.map(async (file) => {
          const filePath = await saveFile(file);
          // Push the file path into the photoUrls array
          itemsUrls.push(filePath);
        });
        // Wait for all file upload promises to resolve
        await Promise.all(uploadPromises);
        const updateLesson = await this.prisma.lessons.update({
          where: { id: +body.id },
          data: {
            videoUrl: filePath,
            items: itemsUrls,
            ...body,
          },
        });
        return updateLesson;
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.FORBIDDEN);
    }
  }

  async remove(id: number) {
    const questions = await this.prisma.questions.findMany({
      where: { lessonId: id },
    });
    for (let k = 0; k < questions.length; k++) {
      await this.prisma.answers.deleteMany({
        where: { questionId: questions[k].id },
      });
    }
    await this.prisma.questions.deleteMany({
      where: { lessonId: id },
    });
    const deleteLesson = await this.prisma.lessons.delete({
      where: { id: id },
    });
    return deleteLesson;
  }

  async findByModuleId(id: number) {
    return await this.prisma.lessons.findMany({
      where: {
        moduleId: id,
      },
    });
  }

  async findOne(id: number) {
    return await this.prisma.lessons.findUnique({
      where: { id: id },
    });
  }
}
