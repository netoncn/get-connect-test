import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { OpenLibraryProvider } from './providers/open-library.provider';

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, OpenLibraryProvider],
  exports: [CatalogService],
})
export class CatalogModule {}
