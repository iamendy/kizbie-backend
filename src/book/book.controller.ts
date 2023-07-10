import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { ACGuard, UseRoles } from 'nest-access-control';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  findAll() {
    return this.bookService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }

  @UseGuards(JwtGuard, ACGuard)
  @UseRoles({
    resource: 'book',
    action: 'create',
    possession: 'any',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() createBookDto: CreateBookDto, @GetUser('id') userId: string) {
    return this.bookService.create(createBookDto, userId);
  }

  @UseGuards(JwtGuard, ACGuard)
  @UseRoles({
    resource: 'book',
    action: 'update',
    possession: 'any',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(+id, updateBookDto);
  }

  @UseGuards(JwtGuard, ACGuard)
  @UseRoles({
    resource: 'book',
    action: 'delete',
    possession: 'any',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookService.remove(+id);
  }
}
