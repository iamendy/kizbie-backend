import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  create(createBookDto: CreateBookDto) {
    return 'This action adds a new book';
  }

  async findAll() {
    const books = await this.prisma.book.findMany();
    return books;
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: {
        id,
      },
    });
    return book;
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
