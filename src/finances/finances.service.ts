import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { PaymentType } from '@prisma/client';

@Injectable()
export class FinancesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPayments(
    from_date: Date | null,
    until: Date | null,
    paymentType: PaymentType | null,
    take: number | null,
    skip: number | null,
  ) {
    return await this.prisma.payments.findMany({
      select: {
        id: true,
        userId: true,
        paymentType: true,
        amount: true,
        createdAt: true,
        User: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
          },
        },
      },
      where: {
        ...(paymentType && { paymentType }),
        ...(from_date || until
          ? {
              createdAt: {
                ...(from_date && { gte: from_date }),
                ...(until && { lte: until }),
              },
            }
          : {}),
      },
      ...(take !== null && { take }),
      ...(skip !== null && { skip }),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getSumOfPayments(
    from_date: Date | null,
    until: Date | null,
    paymentType: PaymentType | null,
  ) {
    const result = await this.prisma.payments.aggregate({
      _sum: {
        amount: true, // adjust 'amount' to the actual numeric field you're summing
      },
      where: {
        ...(paymentType && { paymentType }),
        ...(from_date || until
          ? {
              createdAt: {
                ...(from_date && { gte: from_date }),
                ...(until && { lte: until }),
              },
            }
          : {}),
      },
    });

    return result._sum.amount || 0;
  }

  async filterPayments(fullName: string, phoneNumber: string) {
    return this.prisma.payments.findMany({
      where: {
        User: {
          ...(fullName && {
            fullName: {
              contains: fullName,
              mode: 'insensitive',
            },
          }),
          ...(phoneNumber && {
            phoneNumber: {
              contains: phoneNumber,
              mode: 'insensitive',
            },
          }),
        },
      },
      select: {
        id: true,
        userId: true,
        paymentType: true,
        amount: true,
        createdAt: true,
        User: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
          },
        }, // чтобы получить данные пользователя с платежами
      },
    });
  }
}
