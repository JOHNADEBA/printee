import { Injectable, BadRequestException } from '@nestjs/common';
import { Document as PrismaDocument } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

interface Document extends PrismaDocument {
  status?: string;
}

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async uploadFile(
    file: Express.Multer.File,
    clerkUserId: string,
  ): Promise<Document> {
    if (!clerkUserId) {
      throw new BadRequestException('clerkUserId is required');
    }
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
    });
    if (!user) throw new BadRequestException('User not found');

    const fileUrl = path.join('uploads', file.filename).replace(/\\/g, '/');
    let pageCount = 1;

    const filePath = path.resolve(fileUrl);
    if (file.originalname.endsWith('.pdf')) {
      try {
        // Dynamically import pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist/build/pdf');
        const { getDocument, GlobalWorkerOptions } = pdfjsLib;

        // Set the worker path
        GlobalWorkerOptions.workerSrc = await import(
          'pdfjs-dist/build/pdf.worker.entry'
        );

        const data = new Uint8Array(await fs.readFile(filePath));
        const pdf = await getDocument({ data }).promise;
        pageCount = pdf.numPages;
      } catch (err) {
        pageCount = 1;
      }
    } else {
      pageCount = 1;
    }

    const document = await this.prisma.document.create({
      data: {
        filename: file.originalname,
        fileUrl,
        pageCount,
        userId: user.id,
      },
    });

    return document;
  }

  async getUserDocuments(clerkUserId: string): Promise<Document[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) throw new BadRequestException('User not found');

    return await this.prisma.document.findMany({
      where: { userId: user.id },
    });
  }

  async printDocument(
    documentId: number,
    clerkUserId: string,
  ): Promise<Document & { status: string }> {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
    });
    if (!user) throw new BadRequestException('User not found');

    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId: user.id },
    });
    if (!document) throw new BadRequestException('Document not found');

    const pageCount = document.pageCount;
    const totalCost = pageCount;

    if (user.coins < totalCost) {
      throw new BadRequestException(
        `Insufficient coins. You need ${totalCost} coins to print ${pageCount} page(s), but you have ${user.coins} coins.`,
      );
    }

    // Deduct coins and set isPrinted to true
    await Promise.all([
      this.prisma.user.update({
        where: { id: user.id },
        data: { coins: user.coins - totalCost },
      }),
      this.prisma.document.update({
        where: { id: documentId },
        data: { isPrinted: true },
      }),
    ]);

    // Simulate printing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const updatedDocument = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    return { ...updatedDocument!, status: 'printed' };
  }

  async deleteDocument(
    documentId: number,
    clerkUserId: string,
  ): Promise<Document> {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
    });
    if (!user) throw new BadRequestException('User not found');

    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId: user.id },
    });
    if (!document) throw new BadRequestException('Document not found');

    const filePath = path.resolve(document.fileUrl);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      throw new BadRequestException('Error deleting file');
    }

    return this.prisma.document.delete({
      where: { id: documentId },
    });
  }

  async downloadDocument(documentId: number, clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
    });
    if (!user) throw new BadRequestException('User not found');

    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId: user.id },
    });
    if (!document) throw new BadRequestException('Document not found');

    const filePath = path.resolve(document.fileUrl);
    return { filePath, filename: document.filename };
  }
}
