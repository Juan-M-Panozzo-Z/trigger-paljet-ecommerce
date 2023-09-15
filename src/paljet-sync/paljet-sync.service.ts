import { Injectable } from '@nestjs/common';
import * as firebird from 'node-firebird';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './models/article.model';
import { ListPrice } from './models/listPrice.model';
import { Stock } from './models/stock.model';
import { Brand } from './models/brand.model';

@Injectable()
export class PaljetSyncService {
  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
    @InjectModel(ListPrice.name)
    private readonly listPriceModel: Model<ListPrice>,
    @InjectModel(Stock.name) private readonly stockModel: Model<Stock>,
    @InjectModel(Brand.name) private readonly brandModel: Model<Brand>,
  ) {}

  options: firebird.Options = {
    // host: 'rigelec.com.ar',
    host: 'localhost',
    port: 3050,
    database: 'D:\\ETSOL\\PaljetERP\\database\\DBSIF.FDB',
    user: 'SYSDBA',
    password: 'masterkey',
  };

  async syncArticles() {
    const query =
      'SELECT ART_ID, COD_ART, EAN, DESCRIPCION, MOD, MED, URL_ARCHIVO, MARCA_ID FROM ARTICULOS WHERE MARCA_ID IS NOT NULL';
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
                COD_ART: item.COD_ART,
                EAN: item.EAN,
                DESCRIPCION: item.DESCRIPCION,
                MOD: item.MOD,
                MED: item.MED,
                URL_ARCHIVO: item.URL_ARCHIVO,
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
        db.detach();
      });
    });
  }

  async syncPriceList() {
    const query = 'SELECT * FROM ARTLPR WHERE LISTA_ID = 11';
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
            console.log(existingArtlpr);

            if (!existingArtlpr) {
              console.log('no existe');
              const newArtlpr = new this.listPriceModel({
                _id: item.ARTLPR_ID,
                ART_ID: item.ART_ID,
                PC_CTO_LISTA: item.PC_CTO_LISTA,
                PR_VTA: item.PR_VTA,
                PR_FINAL: item.PR_FINAL,
              });
              console.log(newArtlpr);

              await newArtlpr.save();
              newArtlprCount++;
            }
          }

          resolve(
            `Sincronización funcionando correctamente. Se agregaron ${newArtlprCount} nuevos precios.`,
          );
        });
        db.detach();
      });
    });
  }

  async syncStock() {
    const query = 'SELECT STK_ID, ART_ID, DISPONIBLE FROM STOCK';
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
        db.detach();
      });
    });
  }

  async syncBrands() {
    return new Promise<string>(async (resolve, reject) => {
      firebird.attach(this.options, (err, db) => {
        if (err) {
          reject(err);
          return;
        }

        db.query(
          'SELECT MARCA_ID, MARCA FROM MARCAS',
          [],
          async (err, result) => {
            if (err) {
              reject(err);
              return;
            }

            let newBrandCount = 0;
            for (const item of result) {
              console.log(
                `Cantidad de marcas sincronizadas: ${newBrandCount} de ${result.length}`,
              );
              const existingBrand = await this.brandModel.findOne({
                _id: item.MARCA_ID,
              });

              if (!existingBrand) {
                const newBrand = new this.brandModel({
                  _id: item.MARCA_ID,
                  MARCA: item.MARCA,
                });

                await newBrand.save();
                newBrandCount++;
              }
            }

            resolve(`Sincronización funcionando correctamente.`);
          },
        );
        db.detach();
      });
    });
  }

  async syncPurchases() {
    return new Promise<string>(async (resolve, reject) => {
      firebird.attach(this.options, (err, db) => {
        if (err) {
          reject(err);
          return;
        }

        db.query(
          'SELECT * FROM CPR WHERE FEC_EMISION >= ?',
          [new Date(2023, 8, 20)],
          async (err, result) => {
            if (err) {
              reject(err);
              return;
            }
            console.log(result);
            resolve('Listado en consola');
          },
        );
        db.detach();
      });
    });
  }
}
