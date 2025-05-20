import { Injectable } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(body: CreateModuleDto) {
    return await this.prisma.modules.create({
      data: {
        ...body,
      },
    });
  }
  async update(id: number, body: UpdateModuleDto) {
    return await this.prisma.modules.update({
      where: { id: id },
      data: {
        ...body,
      },
    });
  }

  async remove(id: number) {
    const lessons = await this.prisma.lessons.findMany({
      where: { moduleId: id },
    });
    for (let j = 0; j < lessons.length; j++) {
      const questions = await this.prisma.questions.findMany({
        where: { lessonId: lessons[j].id },
      });
      for (let k = 0; k < questions.length; k++) {
        await this.prisma.answers.deleteMany({
          where: { questionId: questions[k].id },
        });
      }
      await this.prisma.questions.deleteMany({
        where: { lessonId: lessons[j].id },
      });
    }
    await this.prisma.lessons.deleteMany({
      where: { moduleId: id },
    });
    const deletedModule = await this.prisma.modules.delete({
      where: { id: id },
    });
    return deletedModule;
  }

  async findByCourseId(id: number) {
    return await this.prisma.modules.findMany({
      where: {
        courseId: id,
      },
    });
  }

  async findOne(id: number) {
    return await this.prisma.modules.findUnique({
      where: { id: id },
    });
  }

  async findAll() {
    return await this.prisma.modules.findMany();
  }
}
