import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './book/book.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [AuthModule, BookModule, CommentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
