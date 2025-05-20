// import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/prisma.service';
// import { getUzumHeaders } from './functions';

// @Injectable()
// export class UzumService {
//   constructor(private readonly prisma: PrismaService) {}

//   async createCardToken(
//     card_number: string,
//     expire_date: string,
//     userId: number,
//   ) {
//     const response = await fetch(
//       `${process.env.UZUM_BASE_URL}/api/v1/payment/register`, // Замените URL на правильный эндпоинт
//       {
//         method: 'POST',
//         headers: await getUzumHeaders(),
//         body: JSON.stringify({
//           card_number: card_number,
//           expire_date: expire_date,
//           temporary: 1,
//         }),
//       },
//     ).catch((error) => {
//       console.log(error);
//       throw new HttpException(error, HttpStatus.BAD_REQUEST);
//     });

//     const data = await response.json();
//     console.log(data);
//     // Save card token to the database or update if it exists
//     await this.prisma.uzumCards.upsert({
//       where: {
//         cardNumber: card_number,
//       },
//       update: {
//         cardToken: data.card_token,
//         userId: userId,
//       },
//       create: {
//         cardNumber: card_number,
//         cardToken: data.card_token,
//         expireDate: expire_date,
//         phoneNumber: data.phone_number,
//         userId: userId,
//       },
//     });
//     return data;
//   }

//   async confirmCardToken(card_number: string, sms_code: number) {
//     const card_token = await this.prisma.uzumCards.findUnique({
//       where: {
//         cardNumber: card_number,
//       },
//     });

//     const response = await fetch(
//       `${process.env.UZUM_BASE_URL}/api/v1/payment/verify`, // Замените URL на правильный эндпоинт
//       {
//         method: 'POST',
//         headers: await getUzumHeaders(),
//         body: JSON.stringify({
//           card_token: card_token.cardToken,
//           sms_code: sms_code,
//         }),
//       },
//     ).catch((error) => {
//       throw new HttpException(error, HttpStatus.BAD_REQUEST);
//     });

//     const data = await response.json();
//     return data;
//   }

//   async payWithCardToken(card_number: string, amount: number, userId: number) {
//     const card_token = await this.prisma.uzumCards.findUnique({
//       where: {
//         cardNumber: card_number,
//       },
//     });

//     const user = await this.prisma.user.findUnique({
//       where: {
//         id: userId,
//       },
//     });

//     const response = await fetch(
//       `${process.env.UZUM_BASE_URL}/api/v1/acquiring/payment`, // Замените URL на правильный эндпоинт
//       {
//         method: 'POST',
//         headers: await getUzumHeaders(),
//         body: JSON.stringify({
//           card_token: card_token.cardToken,
//           amount: amount,
//           transaction_parameter: user.fullName,
//         }),
//       },
//     ).catch((error) => {
//       throw new HttpException(error, HttpStatus.BAD_REQUEST);
//     });

//     const data = await response.json();
//     return data;
//   }

//   async deleteCardToken(card_token: string) {
//     const response = await fetch(
//       `${process.env.UZUM_BASE_URL}/api/v1/payment/delete/${card_token}`, // Замените URL на правильный эндпоинт
//       {
//         method: 'DELETE',
//         headers: await getUzumHeaders(),
//       },
//     ).catch((error) => {
//       return error;
//     });

//     const data = await response.json();
//     return data;
//   }

//   // Additional methods for handling invoices and payments, if required

//   async createInvoice(
//     amount: number,
//     phone_number: string,
//     merchant_trans_id: string,
//   ) {
//     const response = await fetch(
//       `${process.env.UZUM_BASE_URL}/api/v1/invoice/create`, // Замените URL на правильный эндпоинт
//       {
//         method: 'POST',
//         headers: await getUzumHeaders(),
//         body: JSON.stringify({
//           amount: amount,
//           phone_number: phone_number,
//           merchant_trans_id: merchant_trans_id,
//         }),
//       },
//     ).catch((error) => {
//       return error;
//     });

//     const data = await response.json();
//     return data;
//   }

//   async checkInvoiceStatus(invoice_id: string) {
//     const response = await fetch(
//       `${process.env.UZUM_BASE_URL}/api/v1/invoice/status/${invoice_id}`, // Замените URL на правильный эндпоинт
//       {
//         method: 'GET',
//         headers: await getUzumHeaders(),
//       },
//     ).catch((error) => {
//       return error;
//     });

//     const data = await response.json();
//     return data;
//   }

//   async checkPaymentStatus(payment_id: string) {
//     const response = await fetch(
//       `${process.env.UZUM_BASE_URL}/api/v1/payment/status/${payment_id}`, // Замените URL на правильный эндпоинт
//       {
//         method: 'GET',
//         headers: await getUzumHeaders(),
//       },
//     ).catch((error) => {
//       throw new HttpException(error, HttpStatus.BAD_REQUEST);
//     });

//     const data = await response.json();
//     return data;
//   }

//   async cancelPayment(payment_id: string) {
//     const response = await fetch(
//       `${process.env.UZUM_BASE_URL}/api/v1/payment/cancel/${payment_id}`, // Замените URL на правильный эндпоинт
//       {
//         method: 'DELETE',
//         headers: await getUzumHeaders(),
//       },
//     ).catch((error) => {
//       return error;
//     });

//     const data = await response.json();
//     return data;
//   }
// }
