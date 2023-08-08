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

  @Get('articles')
  async syncData() {
    const query =
      'SELECT ART_ID, EAN, DESCRIPCION, MOD, MED, MARCA_ID FROM ARTICULOS WHERE MARCA_ID IS NOT NULL';
    return new Promise<string>((resolve, reject) => {
      firebird.attach(this.options, (err, db) => {
        if (err) {
          reject(err);
          return;
        }

        db.query(query, [], async (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          let newArticleCount = 0;

          for (const item of result) {
            console.log(
              `Cantidad de artículos sincronizados: ${newArticleCount} de ${result.length}`,
            );
            const existingArticle = await this.articleModel.findOne({
              _id: item.ART_ID,
            });

            if (!existingArticle) {
              const newArticle = new this.articleModel({
                _id: item.ART_ID,
                EAN: item.EAN,
                DESCRIPCION: item.DESCRIPCION,
                MOD: item.MOD,
                MED: item.MED,
                MARCA_ID: item.MARCA_ID,
              });

              await newArticle.save();
              newArticleCount++;
            }
          }

          resolve(
            `Sincronización funcionando correctamente. Se agregaron ${newArticleCount} nuevos artículos.`,
          );
        });
      });
    });
  }
  @Get('price-list')
  async getPriceList() {
    const query = `SELECT * FROM ARTLPR WHERE LISTA_ID = 11`;
    return new Promise<string>((resolve, reject) => {
      firebird.attach(this.options, (err, db) => {
        if (err) {
          reject(err);
          return;
        }

        db.query(query, [], async (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          let newArtlprCount = 0;

          for (const item of result) {
            console.log(
              `Cantidad de precios sincronizados: ${newArtlprCount} de ${result.length}`,
            );
            const existingArtlpr = await this.listPriceModel.findOne({
              _id: item.ARTLPR_ID,
            });

            if (!existingArtlpr) {
              const newArtlpr = new this.listPriceModel({
                _id: item.ARTLPR_ID,
                ART_ID: item.ART_ID,
                PC_CTO_LISTA: item.PC_CTO_LISTA,
                PR_VTA: item.PR_VTA,
                PR_FINAL: item.PR_FINAL,
              });

              await newArtlpr.save();
              newArtlprCount++;
            }
          }

          resolve(
            `Sincronización funcionando correctamente. Se agregaron ${newArtlprCount} nuevos precios.`,
          );
        });
      });
    });
  }

  @Get('stock')
  async getStock() {
    const query = `SELECT STK_ID, ART_ID, DISPONIBLE FROM STOCK`;
    return new Promise<string>((resolve, reject) => {
      firebird.attach(this.options, (err, db) => {
        if (err) {
          reject(err);
          return;
        }

        db.query(query, [], async (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          let newStockCount = 0;

          for (const item of result) {
            console.log(
              `Cantidad de stock sincronizados: ${newStockCount} de ${result.length}`,
            );
            const existingStock = await this.stockModel.findOne({
              _id: item.STK_ID,
            });

            if (!existingStock) {
              const newStock = new this.stockModel({
                _id: item.STK_ID,
                ART_ID: item.ART_ID,
                DISPONIBLE: item.DISPONIBLE,
              });

              await newStock.save();
              newStockCount++;
            }
          }

          resolve(
            `Sincronización funcionando correctamente. Se agregaron ${newStockCount} nuevos stock.`,
          );
        });
      });
    });
  }

  @Get('stock/count')
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
