import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(body: CreateQuestionDto) {
    const question = await this.prisma.questions.create({
      data: {
        title: body.title,
        lessonId: body.lessonId,
      },
    });
    body.answers.forEach(async (title, index) => {
      await this.prisma.answers.create({
        data: {
          title: title,
          isCorrect: index === body.correctAnswer,
          questionId: question.id,
        },
      });
    });

    setTimeout(() => {}, 1000);
    return await this.prisma.questions.findUnique({
      where: { id: question.id },
      include: { answers: true },
    });
  }

  async update(body: UpdateQuestionDto) {
    await this.prisma.answers.deleteMany({
      where: { questionId: body.id },
    });
    await this.prisma.questions.update({
      where: { id: body.id },
      data: { title: body.title },
    });
    body.answers.forEach(async (title, index) => {
      await this.prisma.answers.create({
        data: {
          title: title,
          isCorrect: index === body.correctAnswer,
          questionId: body.id,
        },
      });
    });
    setTimeout(() => {}, 1000);
    return await this.prisma.questions.findUnique({
      where: { id: body.id },
      include: { answers: true },
    });
  }

  async findAll() {
    return await this.prisma.questions.findMany({ include: { answers: true } });
  }

  async findOne(id: number) {
    return await this.prisma.questions.findUnique({
      where: { id: id },
      include: { answers: true },
    });
  }

  async remove(id: number) {
    await this.prisma.answers.deleteMany({
      where: { questionId: id },
    });
    return await this.prisma.questions.delete({ where: { id: id } });
  }

  async findByLessonId(id: number) {
    return await this.prisma.questions.findMany({
      where: { lessonId: id },
      include: { answers: true },
    });
  }
}
