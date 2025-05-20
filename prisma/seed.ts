import { PaymentType, PrismaClient, ProductType } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear all data
  await prisma.notes.deleteMany();
  await prisma.paid.deleteMany();
  await prisma.payments.deleteMany();
  await prisma.user.deleteMany();
  await prisma.lessons.deleteMany();
  await prisma.modules.deleteMany();
  await prisma.courses.deleteMany();

  // Courses

  await prisma.courses.create({
    data: {
      id: 1,
      title: 'Course1: Business Administration',
      description: 'Business Administration course description',
      author: 'Author 1',
      time: '10h',
      price: 3000000,
      photoUrls: ['url1', 'url2'],
      modules: {
        create: [
          {
            id: 1,
            title: 'Moddule1: Introduction to Business Administration',
            time: '2h',
            price: 2000000,
            lessons: {
              create: [
                {
                  id: 1,
                  title: 'Lesson1: Create a Business Plan',
                  videoUrl: 'video_url_1',
                  time: '1h',
                  price: 1200000,
                },
                {
                  id: 2,
                  title: 'Lesson2: Business Administration Basics',
                  videoUrl: 'video_url_2',
                  time: '1h',
                  price: 1200000,
                },
              ],
            },
          },
          {
            id: 2,
            title: 'Module2: Business Administration Advanced',
            time: '8h',
            price: 2000000,
            lessons: {
              create: [
                {
                  id: 3,
                  title: 'Lesson3: Business Administration Advanced',
                  videoUrl: 'video_url_3',
                  time: '4h',
                  price: 1200000,
                },
                {
                  id: 4,
                  title: 'Lesson4: Business Administration Advanced 2',
                  videoUrl: 'video_url_4',
                  time: '4h',
                  price: 1200000,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.courses.create({
    data: {
      id: 2,
      title: 'Course2: Business Administration',
      description: ' Administration course description',
      author: 'Author 2',
      time: '10h',
      price: 3000000,
      photoUrls: ['url1', 'url2'],
      modules: {
        create: [
          {
            id: 3,
            title: 'Moddule1: Introduction to Business Administration',
            time: '2h',
            price: 2000000,
            lessons: {
              create: [
                {
                  id: 5,
                  title: 'Lesson1: Create a Business Plan',
                  videoUrl: 'video_url_1',
                  time: '1h',
                  price: 1200000,
                },
                {
                  id: 6,
                  title: 'Lesson2: Business Administration Basics',
                  videoUrl: 'video_url_2',
                  time: '1h',
                  price: 1200000,
                },
              ],
            },
          },
          {
            id: 4,
            title: 'Module2: Business Administration Advanced',
            time: '8h',
            price: 2000000,
            lessons: {
              create: [
                {
                  id: 7,
                  title: 'Lesson3: Business Administration Advanced',
                  videoUrl: 'video_url_3',
                  time: '4h',
                  price: 1200000,
                },
                {
                  id: 8,
                  title: 'Lesson4: Business Administration Advanced 2',
                  videoUrl: 'video_url_4',
                  time: '4h',
                  price: 1200000,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.courses.create({
    data: {
      id: 3,
      title: 'Course3: Business Administration',
      description: ' Administration course description',
      author: 'Author 3',
      time: '10h',
      price: 3000000,
      photoUrls: ['url1', 'url2'],
      modules: {
        create: [
          {
            id: 5,
            title: 'Moddule1: Introduction to Business Administration',
            time: '2h',
            price: 2000000,
            lessons: {
              create: [
                {
                  id: 9,
                  title: 'Lesson1: Create a Business Plan',
                  videoUrl: 'video_url_1',
                  time: '1h',
                  price: 1200000,
                },
                {
                  id: 10,
                  title: 'Lesson2: Business Administration Basics',
                  videoUrl: 'video_url_2',
                  time: '1h',
                  price: 1200000,
                },
              ],
            },
          },
          {
            id: 6,
            title: 'Module2: Business Administration Advanced',
            time: '8h',
            price: 2000000,
            lessons: {
              create: [
                {
                  id: 11,
                  title: 'Lesson3: Business Administration Advanced',
                  videoUrl: 'video_url_3',
                  time: '4h',
                  price: 1200000,
                },
                {
                  id: 12,
                  title: 'Lesson4: Business Administration Advanced 2',
                  videoUrl: 'video_url_4',
                  time: '4h',
                  price: 1200000,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Users
  await prisma.user.create({
    data: {
      id: 1,
      fullName: 'Rediska Kolobkovna',
      phoneNumber: '+998901234567',
      password: '$2a$10$UfYmSCVDFovTdfKwWjJjxenQpXVfYjfI0W7hDOcNqTKDV7kO8xRZu',
      authorized: true,
    },
  });

  await prisma.payments.create({
    data: {
      id: 1,
      amount: 0,
      paymentType: PaymentType.payme,
      userId: 1,
    },
  });

  await prisma.paid.create({
    data: {
      userId: 1,
      courseId: 2,
      productType: ProductType.course,
      amount: 0,
      PaymentsId: 1,
    },
  });

  await prisma.paid.create({
    data: {
      userId: 1,
      moduleId: 1,
      productType: ProductType.module,
      amount: 0,
      PaymentsId: 1,
    },
  });

  await prisma.paid.create({
    data: {
      userId: 1,
      lessonId: 3,
      productType: ProductType.lesson,
      amount: 0,
      PaymentsId: 1,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
