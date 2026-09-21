import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CalendarModule } from './calendar/calendar.module.js';
import { validateEnvironment } from './config/environment.js';
import { DatabaseModule } from './database/database.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { HealthModule } from './health/health.module.js';
import { LibraryModule } from './library/library.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { UsersModule } from './users/users.module.js';
import { WhiteboardsModule } from './whiteboards/whiteboards.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment,
    }),
    DatabaseModule,
    HealthModule,
    UsersModule,
    TasksModule,
    CalendarModule,
    WhiteboardsModule,
    LibraryModule,
    DocumentsModule,
  ],
})
export class AppModule {}
