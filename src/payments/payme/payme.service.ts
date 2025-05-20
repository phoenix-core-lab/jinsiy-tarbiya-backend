import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import getPaymeHeaders from './functions';
import { PaymentType, ProductType } from '@prisma/client';

@Injectable()
export class PaymeService {
  constructor(private readonly prisma: PrismaService) {}

  async cardsCreate(
    card_number: string,
    expire_date: string,
    userId: number = 0,
  ) {
    const response = await fetch(`${process.env.PAYME_MERCHANT_URL}`, {
      method: 'POST',
      headers: await getPaymeHeaders(),
      body: JSON.stringify({
        id: userId,
        method: 'cards.create',
        params: {
          card: { number: card_number, expire: expire_date },
          save: false,
        },
      }),
    }).catch((error) => {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    });
    const data = await response.json();
    // Save card token to the database or update if it exists
    await this.prisma.paymeCards.upsert({
      where: {
        cardNumber: card_number,
      },
      update: {
        cardToken: data.result.card.token,
        userId: userId,
      },
      create: {
        cardNumber: card_number,
        cardToken: data.result.card.token,
        expireDate: expire_date,
        userId: userId,
      },
    });
    return data;
  }

  async cardGetVerifyCode(card_number: string) {
    const card_token = await this.prisma.paymeCards.findUnique({
      where: {
        cardNumber: card_number,
      },
    });
    const response = await fetch(`${process.env.PAYME_MERCHANT_URL}`, {
      method: 'POST',
      headers: await getPaymeHeaders(),
      body: JSON.stringify({
        id: card_token.userId,
        method: 'cards.get_verify_code',
        params: {
          token: card_token.cardToken,
        },
      }),
    }).catch((error) => {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    });
    const data = await response.json();
    return data;
  }

  async cardVerify(card_number: string, code: string) {
    const card_token = await this.prisma.paymeCards.findUnique({
      where: {
        cardNumber: card_number,
      },
    });
    const response = await fetch(`${process.env.PAYME_MERCHANT_URL}`, {
      method: 'POST',
      headers: await getPaymeHeaders(),
      body: JSON.stringify({
        id: card_token.userId,
        method: 'cards.verify',
        params: {
          token: card_token.cardToken,
          code: code,
        },
      }),
    }).catch((error) => {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    });
    const data = await response.json();
    return data;
  }

  async cardCheck(card_number: string) {
    const card_token = await this.prisma.paymeCards.findUnique({
      where: {
        cardNumber: card_number,
      },
    });
    const response = await fetch(`${process.env.PAYME_MERCHANT_URL}`, {
      method: 'POST',
      headers: await getPaymeHeaders(),
      body: JSON.stringify({
        id: card_token.userId,
        method: 'cards.check',
        params: {
          token: card_token.cardToken,
        },
      }),
    }).catch((error) => {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    });
    const data = await response.json();
    return data;
  }

  async cardRemove(card_number: string) {
    const card_token = await this.prisma.paymeCards.findUnique({
      where: {
        cardNumber: card_number,
      },
    });
    const response = await fetch(`${process.env.PAYME_MERCHANT_URL}`, {
      method: 'POST',
      headers: await getPaymeHeaders(),
      body: JSON.stringify({
        id: card_token.userId,
        method: 'cards.remove',
        params: {
          token: card_token.cardToken,
        },
      }),
    }).catch((error) => {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    });
    const data = await response.json();
    return data;
  }

  async recieptsCreate(amount: number, userId: number) {
    console.log('recieptsCreate', amount);
    const response = await fetch(`${process.env.PAYME_MERCHANT_URL}`, {
      method: 'POST',
      headers: await getPaymeHeaders(true),
      body: JSON.stringify({
        id: userId,
        method: 'receipts.create',
        params: {
          amount: amount * 100,
          account: {
            order_id: Math.floor(Math.random() * 10000000),
          },
        },
      }),
    }).catch((error) => {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    });
    const data = await response.json();
    return data;
  }

  async receiptsPay(card_number: string, receiptsId: string) {
    const card_token = await this.prisma.paymeCards.findUnique({
      where: {
        cardNumber: card_number,
      },
    });
    const response = await fetch(`${process.env.PAYME_MERCHANT_URL}`, {
      method: 'POST',
      headers: await getPaymeHeaders(true),
      body: JSON.stringify({
        id: card_token.userId,
        method: 'receipts.pay',
        params: {
          token: card_token.cardToken,
          id: receiptsId,
          payer: {
            phone: card_token.phoneNumber,
          },
        },
      }),
    }).catch((error) => {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    });
    const data = await response.json();
    return data;
  }

  // Методы для расчета цен
  async calculateLessonPrice(lessonId: number): Promise<number> {
    const lesson = await this.prisma.lessons.findUnique({
      where: { id: lessonId },
    });
    if (!lesson)
      throw new HttpException('Урок не найден', HttpStatus.NOT_FOUND);
    // Пример логики расчета цены
    return lesson.price; // Или расчет на основе содержания
  }

  async calculateModulePrice(
    moduleId: number,
    userId: number,
  ): Promise<number> {
    // Fetch the module details
    const module = await this.prisma.modules.findUnique({
      where: { id: moduleId },
      select: {
        id: true,
        price: true,
        lessons: {
          select: { id: true },
        },
        Paid: {
          where: { userId: userId },
          select: { id: true },
        },
      },
    });

    if (!module) {
      throw new HttpException('Модуль не найден', HttpStatus.NOT_FOUND);
    }

    // Determine if the module is paid by the user
    const isPaid = module.Paid.length > 0;

    // Fetch the paid lessons for this user in this module
    const paidLessons = await this.prisma.lessons.findMany({
      where: {
        moduleId: moduleId,
        Paid: { some: { userId: userId } },
      },
      select: { id: true },
    });

    // Calculate the price based on the proportion of purchased lessons
    if (!isPaid) {
      const totalLessons = module.lessons.length;
      const paidLessonsCount = paidLessons.length;

      if (paidLessonsCount === totalLessons && totalLessons > 0) {
        return 0; // Module is fully paid for, so the price is 0
      } else {
        const proportionPaid = paidLessonsCount / totalLessons || 0;
        return Math.round((module.price * (1 - proportionPaid)) / 1000) * 1000;
      }
    } else {
      return 0; // Module is already paid for, so the price is 0
    }
  }

  async calculateCoursePrice(id: number, userId: number) {
    // Fetch the course by its ID
    const course: any = await this.prisma.courses.findUnique({
      where: { id: id },
      select: {
        id: true,
        title: true,
        description: true,
        photoUrls: true,
        time: true,
        price: true,
        author: true,
        Paid: {
          where: { userId: userId },
          select: { id: true },
        },
        modules: {
          select: {
            id: true,
            title: true,
            time: true,
            price: true,
            lessons: {
              select: {
                id: true,
                title: true,
                time: true,
                price: true,
                Paid: {
                  where: { userId: userId },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }

    // Check if the course is paid
    course.paid = course.Paid.length > 0;
    delete course.Paid;

    // If the course is paid, set all modules and lessons to paid
    if (course.paid) {
      course.price = 0;
      course.modules = course.modules.map((module) => {
        module.paid = true;
        module.price = 0;
        module.lessons = module.lessons.map((lesson) => {
          lesson.paid = true;
          lesson.price = 0;
          delete lesson.Paid;
          return lesson;
        });
        delete module.Paid;
        return module;
      });
    } else {
      // Fetch all paid modules for the course
      const paidModules = await this.prisma.modules.findMany({
        where: {
          courseId: id,
          Paid: { some: { userId: userId } },
        },
        select: { id: true },
      });

      // Update the modules based on their paid status
      course.modules = await Promise.all(
        course.modules.map(async (module) => {
          const isModulePaid = paidModules.some((m) => m.id === module.id);

          if (isModulePaid) {
            module.paid = true;
            module.price = 0;
            module.lessons = module.lessons.map((lesson) => {
              lesson.paid = true;
              lesson.price = 0;
              delete lesson.Paid;
              return lesson;
            });
          } else {
            // Fetch paid lessons for the module
            const paidLessons = await this.prisma.lessons.findMany({
              where: {
                moduleId: module.id,
                Paid: { some: { userId: userId } },
              },
              select: { id: true },
            });

            module.lessons = module.lessons.map((lesson) => {
              const isLessonPaid = paidLessons.some((l) => l.id === lesson.id);

              if (isLessonPaid) {
                lesson.paid = true;
                lesson.price = 0;
              } else {
                lesson.paid = false;
              }

              delete lesson.Paid;
              return lesson;
            });

            // Adjust module price based on the proportion of paid lessons
            const totalLessons = module.lessons.length;
            const paidLessonsCount = paidLessons.length;

            if (paidLessonsCount === totalLessons && totalLessons > 0) {
              module.paid = true;
              module.price = 0;
            } else {
              const proportionPaid = paidLessonsCount / totalLessons || 0;
              module.price =
                Math.round((module.price * (1 - proportionPaid)) / 1000) * 1000;
            }
          }

          return module;
        }),
      );

      // Adjust course price based on the proportion of paid modules
      const totalModules = course.modules.length;
      const paidModulesCount = paidModules.length;

      if (paidModulesCount === totalModules && totalModules > 0) {
        course.paid = true;
        course.price = 0;
      } else {
        const proportionPaid = paidModulesCount / totalModules || 0;
        course.price =
          Math.round((course.price * (1 - proportionPaid)) / 1000) * 1000;
      }
    }

    return course.price;
  }

  async calculatePrice(
    products: { productType: ProductType; productId: number }[],
    userId: number,
  ) {
    let amount = 0;
    for (const product of products) {
      console.log(product);
      switch (product.productType) {
        case ProductType.lesson:
          const lessonPrice = await this.calculateLessonPrice(
            product.productId,
          );
          amount += lessonPrice;
          console.log('lessonPrice', lessonPrice);
          break;
        case ProductType.module:
          const modulePrice = await this.calculateModulePrice(
            product.productId,
            userId,
          );
          amount += modulePrice;
          console.log('modulePrice', modulePrice);
          break;
        case ProductType.course:
          const coursePrice = await this.calculateCoursePrice(
            product.productId,
            userId,
          );
          amount += coursePrice;
          console.log('coursePrice', coursePrice);
          break;
        default:
          throw new HttpException(
            'Неверный тип продукта',
            HttpStatus.BAD_REQUEST,
          );
      }
    }
    return amount;
  }

  async buyProducts(
    products: { productType: ProductType; productId: number }[],
    userId: number,
    amount: number,
  ) {
    // Calculate the price for each product asynchronously
    const paidData = await Promise.all(
      products.map(async (product) => {
        const productAmount = await this.calculatePrice([product], userId);

        return {
          userId: userId,
          amount: productAmount,
          productType: product.productType,
          lessonId:
            product.productType === ProductType.lesson
              ? product.productId
              : undefined,
          moduleId:
            product.productType === ProductType.module
              ? product.productId
              : undefined,
          courseId:
            product.productType === ProductType.course
              ? product.productId
              : undefined,
        };
      }),
    );

    // Create the payment record and associated Paid records
    await this.prisma.payments.create({
      data: {
        amount: amount,
        userId: userId,
        paymentType: PaymentType.payme,
        Paid: {
          create: paidData,
        },
      },
    });
  }
}
