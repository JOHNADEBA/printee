import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { Document as PrismaDocument } from '@prisma/client';
import { DocumentsService } from './documents.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/user/jwt-auth.guard';
import { Response } from 'express';

interface Document extends PrismaDocument {
  status?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ): Promise<Document> {
    const clerkUserId = req.user?.clerkUserId;
    if (!clerkUserId) {
      throw new BadRequestException(
        'Authentication failed: clerkUserId not found in token',
      );
    }
    return this.documentsService.uploadFile(file, clerkUserId);
  }

  @Get('queue')
  async getQueue(@Req() req): Promise<Document[]> {
    const clerkUserId = req.user?.clerkUserId;
    if (!clerkUserId) {
      throw new BadRequestException(
        'Authentication failed: clerkUserId not found in token',
      );
    }
    return this.documentsService.getUserDocuments(clerkUserId);
  }

  @Get('download/:id')
  async downloadDocument(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Res() res: Response,
  ) {
    const clerkUserId = req.user?.clerkUserId;
    const { filePath, filename } = await this.documentsService.downloadDocument(
      id,
      clerkUserId,
    );

    res.download(filePath, filename, (err) => {
      if (err) {
        res.status(500).send('Error downloading file');
      }
    });
  }

  @Post('print/:id')
  async printDocument(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<Document> {
    const clerkUserId = req.user?.clerkUserId;
    if (!clerkUserId) {
      throw new BadRequestException(
        'Authentication failed: clerkUserId not found in token',
      );
    }
    return this.documentsService.printDocument(id, clerkUserId);
  }

  @Delete(':id')
  async deleteDocument(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<Document> {
    const clerkUserId = req.user?.clerkUserId;
    if (!clerkUserId) {
      throw new BadRequestException(
        'Authentication failed: clerkUserId not found in token',
      );
    }
    return this.documentsService.deleteDocument(id, clerkUserId);
  }
}
