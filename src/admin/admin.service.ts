import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async login(name: string, password: string) {
    if (
      name != process.env.ADMIN_NAME &&
      name != process.env.MENTOR_NAME &&
      name != process.env.FINANCE_NAME
    ) {
      console.log(name != process.env.MENTOR_NAME);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (name === process.env.ADMIN_NAME) {
      if (!(await bcrypt.compare(password, process.env.ADMIN_PASSWORD))) {
        throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
      }
      const payload = { sub: 1, name: name };
      return {
        access_token: await this.jwtService.signAsync(payload),
        name: name,
        role: 'admin',
      };
    } else if (name === process.env.MENTOR_NAME) {
      if (!(await bcrypt.compare(password, process.env.MENTOR_PASSWORD))) {
        throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
      }
      const payload = { sub: 1, name: name };
      return {
        access_token: await this.jwtService.signAsync(payload),
        name: name,
        role: 'mentor',
      };
    } else if (name === process.env.FINANCE_NAME) {
      if (!(await bcrypt.compare(password, process.env.FINANCE_PASSWORD))) {
        throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
      }
      const payload = { sub: 1, name: name };
      return {
        access_token: await this.jwtService.signAsync(payload),
        name: name,
        role: 'finance',
      };
    }
  }

  async getStudentCount() {
    return await this.prisma.user.count();
  }

  async findAll(take?: number, skip?: number) {
    const takeNum = Number.isInteger(take) ? take : undefined;
    const skipNum = Number.isInteger(skip) ? skip : undefined;
    return await this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        authorized: true,
        createdAt: true,
        payments: true,
      },
      ...(take !== undefined && { take: takeNum }),
      ...(skip !== undefined && { skip: skipNum }),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async filter(fullName?: string, phoneNumber?: string) {
    return await this.prisma.user.findMany({
      where: {
        ...(fullName
          ? { fullName: { contains: fullName, mode: 'insensitive' } }
          : {}),
        ...(phoneNumber
          ? { phoneNumber: { contains: phoneNumber, mode: 'insensitive' } }
          : {}),
      },
    });
  }
}
