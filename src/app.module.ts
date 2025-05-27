import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from 'src/prisma.service';
import { SmsModule } from './sms/sms.module';
import { CoursesModule } from './courses/courses.module';
import { ItemModule } from './item/item.module';
import { NewsModule } from './news/news.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MessageModule } from './message/message.module';
import { AdminModule } from './admin/admin.module';
import { MentorModule } from './mentor/mentor.module';
import { ModulesModule } from './modules/modules.module';
import { LessonsModule } from './lessons/lessons.module';
import { QuestionsModule } from './questions/questions.module';
import { FinancesModule } from './finances/finances.module';
import { PaymentsModule } from './payments/payments.module';
import { BallsModule } from './balls/balls.module';
import { CheckModule } from './check/check.module';
import { ChatModule } from './chat/chat.module';
import { LibraryModule } from './library/library.module';

@Module({
  imports: [
    AuthModule,
    SmsModule,
    CoursesModule,
    ItemModule,
    NewsModule,
    ChatModule,
    LibraryModule,

    //for serving static files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Path to the uploads directory
      serveRoot: '/uploads', // URL path to serve the files from
    }),

    AdminModule,
    MessageModule,
    MentorModule,
    ModulesModule,
    LessonsModule,
    QuestionsModule,
    FinancesModule,
    PaymentsModule,
    BallsModule,
    CheckModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
