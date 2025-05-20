import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { getClickHeader } from './click.functions';
import { PrismaService } from 'src/prisma.service';
import { PaymentType, ProductType } from '@prisma/client';

@Injectable()
export class ClickService {
  constructor(private readonly prisma: PrismaService) {}

  async createCardToken(
    card_number: string,
    expire_date: string,
    userId: number,
  ) {
    const response = await fetch(
      `${process.env.CLICK_MERCHANT_URL}card_token/request`,
      {
        method: 'POST',
        headers: getClickHeader(),
        body: JSON.stringify({
          service_id: process.env.CLICK_SERVICE_ID,
          card_number: card_number,
          expire_date: expire_date,
          temporary: 1,
        }),
      },
    ).catch((error) => {
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    });
    const data = await response.json();
    console.log(data);
    // Save card token to the database or update if it exists
    await this.prisma.clickCards.upsert({
      where: {
        cardNumber: card_number,
      },
      update: {
        cardToken: data.card_token,
        userId: userId,
      },
      create: {
        cardNumber: card_number,
        cardToken: data.card_token,
        expireDate: expire_date,
        phoneNumber: data.phone_number,
        userId: userId,
      },
    });
    return data;
  }

  async confirmCardToken(card_number: string, sms_code: number) {
    const card_token = await this.prisma.clickCards.findUnique({
      where: {
        cardNumber: card_number,
      },
    });
    const response = await fetch(
      `${process.env.CLICK_MERCHANT_URL}card_token/verify`,
      {
        method: 'POST',
        headers: getClickHeader(),
        body: JSON.stringify({
          service_id: process.env.CLICK_SERVICE_ID,
          card_token: card_token.cardToken,
          sms_code: sms_code,
        }),
      },
    ).catch((error) => {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    });

    const data = await response.json();
    return data;
  }

  async payWithCardToken(
    card_number: string,
    amount: number,
    userId: number,
    // merchant_trans_id: string,
  ) {
    const card_token = await this.prisma.clickCards.findUnique({
      where: {
        cardNumber: card_number,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const response = await fetch(
      `${process.env.CLICK_MERCHANT_URL}card_token/payment`,
      {
        method: 'POST',
        headers: getClickHeader(),
        body: JSON.stringify({
          service_id: process.env.CLICK_SERVICE_ID,
          card_token: card_token.cardToken,
          amount: amount,
          transaction_parameter: user.fullName,
        }),
      },
    ).catch((error) => {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    });
    const data = await response.json();
    return data;
  }

  async deleteCardToken(card_token: string) {
    const response = await fetch(
      `${process.env.CLICK_MERCHANT_URL}card_token/${process.env.CLICK_SERVICE_ID}/${card_token}`,
      {
        method: 'DELETE',
        headers: getClickHeader(),
      },
    ).catch((error) => {
      return error;
    });

    const data = await response.json();
    return data;
  }

  // Method to calculate price based on product type and ID

  // extra functions
  async createInvoice(
    amount: number,
    phone_number: string,
    merchant_trans_id: string,
  ) {
    const response = await fetch(
      `${process.env.CLICK_MERCHANT_URL}invoice/create`,
      {
        method: 'POST',
        headers: getClickHeader(),
        body: JSON.stringify({
          service_id: process.env.CLICK_SERVICE_ID,
          amount: amount,
          phone_number: phone_number,
          merchant_trans_id: merchant_trans_id,
        }),
      },
    ).catch((error) => {
      return error;
    });

    const data = await response.json();
    return data;
  }

  async checkInvoiceStatus(invoice_id: bigint) {
    const response = await fetch(
      `${process.env.CLICK_MERCHANT_URL}invoice/status/${process.env.CLICK_SERVICE_ID}/${invoice_id}`,
      {
        method: 'GET',
        headers: getClickHeader(),
      },
    ).catch((error) => {
      return error;
    });
    const data = await response.json();
    return data;
  }

  async checkPaymentStatus(payment_id: bigint) {
    const response = await fetch(
      ` ${process.env.CLICK_MERCHANT_URL}payment/status/${process.env.CLICK_SERVICE_ID}/${payment_id}`,
      {
        method: 'GET',
        headers: getClickHeader(),
      },
    ).catch((error) => {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    });
    const data = await response.json();
    return data;
  }

  async checkPaymentStatusByMerchantTransId(
    merchant_trans_id: string,
    payment_date: Date | string | number,
  ) {
    // Format the date to YYYY-MM-DD
    const date = new Date(payment_date);
    const formatted_date = date.toISOString().slice(0, 10);
    const response = await fetch(
      `${process.env.CLICK_MERCHANT_URL}payment/status_by_mti/${process.env.CLICK_SERVICE_ID}/${merchant_trans_id}/${formatted_date}`,
      {
        method: 'GET',
        headers: getClickHeader(),
      },
    ).catch((error) => {
      return error;
    });
    const data = await response.json();
    return data;
  }

  async cancelPayment(payment_id: bigint) {
    const response = await fetch(
      `${process.env.CLICK_MERCHANT_URL}payment/reversal/${process.env.CLICK_SERVICE_ID}/${payment_id}`,
      {
        method: 'DELETE',
        headers: getClickHeader(),
      },
    ).catch((error) => {
      return error;
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
