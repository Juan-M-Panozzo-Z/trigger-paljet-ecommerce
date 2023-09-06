import { Controller, Get } from '@nestjs/common';
import { PaljetSyncService } from './paljet-sync.service';

@Controller('paljet-sync')
export class PaljetSyncController {
  constructor(private readonly paljetSyncService: PaljetSyncService) {}

  @Get('articles')
  async syncArticles() {
    return this.paljetSyncService.syncArticles();
  }

  @Get('price-list')
  async syncPriceList() {
    return this.paljetSyncService.syncPriceList();
  }

  @Get('stock')
  async syncStock() {
    return this.paljetSyncService.syncStock();
  }

  @Get('brands')
  async syncBrands() {
    return this.paljetSyncService.syncBrands();
  }

  @Get('purchases')
  async syncPurchases() {
    return this.paljetSyncService.syncPurchases();
  }
}
