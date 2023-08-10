<<<<<<< HEAD
import { Controller, Get, Param } from '@nestjs/common';
import * as firebird from 'node-firebird';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './models/article.model';
import { ListPrice } from './models/listPrice.model';
import { Stock } from './models/stock.model';
@Controller('paljet-sync')
export class PaljetSyncController {
  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
    @InjectModel(ListPrice.name)
    private readonly listPriceModel: Model<ListPrice>,
    @InjectModel(Stock.name) private readonly stockModel: Model<Stock>,
  ) {}

  options: firebird.Options = {
    // host: 'rigelec.com.ar',
    host: '10.16.10.16',
    port: 3050,
    database: 'D:\\ETSOL\\PaljetERP\\database\\DBSIF.FDB',
    user: 'SYSDBA',
    password: 'masterkey',
  };
=======
import { Controller, Get } from '@nestjs/common';
import { PaljetSyncService } from './paljet-sync.service';

@Controller('paljet-sync')
export class PaljetSyncController {
  constructor(private readonly paljetSyncService: PaljetSyncService) {}
>>>>>>> 9e8e026 (borrados:        log.json)

  @Get('articles')
  async syncArticles() {
    console.log('Sincronizando artículos...');
    return this.paljetSyncService.syncArticles();
  }

  @Get('price-list')
  async syncListPrice() {
    console.log('Sincronizando lista de precios...');
    return this.paljetSyncService.getListPrice();
  }

  @Get('stock')
  async syncStock() {
    console.log('Sincronizando stock...');
    return this.paljetSyncService.getStock();
  }

  @Get('stock/count')
<<<<<<< HEAD
  async stockCount() {
    return new Promise<string>(async (resolve, reject) => {
      const firebirdCount = () => {
        const query = `SELECT COUNT(*) FROM STOCK`;
        return new Promise<number>((resolve, reject) => {
          firebird.attach(this.options, (err, db) => {
            if (err) {
              reject(err);
              return;
            }

            db.query(query, [], (err, result) => {
              if (err) {
                reject(err);
                return;
              }

              resolve(result[0].COUNT);
            });
          });
        });
      };

      const mongoCount = () => {
        return this.stockModel.countDocuments().exec();
      };

      try {
        const firebirdResult = await firebirdCount();
        const mongoResult = (await mongoCount()) + 1;
        resolve(
          `Sincronizacion funcionando correctamente. Firebird: ${firebirdResult} - Mongo: ${mongoResult}`,
        );
      } catch (error) {
        reject(error);
      }
    });
=======
  async getStockCount() {
    console.log('Contando stock...');
    return this.paljetSyncService.getStockCount();
>>>>>>> 9e8e026 (borrados:        log.json)
  }

  @Get('stock/:id')
  async stockNow(@Param('id') id: string) {
    const query = `SELECT STK_ID, ART_ID, DISPONIBLE FROM STOCK WHERE ART_ID = ${id}`;
    return new Promise<string>((resolve, reject) => {
      firebird.attach(this.options, (err, db) => {
        err && reject(err);

        db.query(query, [], async (err, result) => {
          err && reject(err);

          resolve(JSON.stringify(result));
        });
      });
    });
  }
}
