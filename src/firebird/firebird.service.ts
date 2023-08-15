import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as firebird from 'node-firebird';
import { Model } from 'mongoose';
import { Article } from '../paljet-sync/models/article.model';
import { ListPrice } from 'src/paljet-sync/models/listPrice.model';
import { Stock } from 'src/paljet-sync/models/stock.model';

@Injectable()
export class FirebirdService implements OnModuleInit {
  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
    @InjectModel(ListPrice.name)
    private readonly listPriceModel: Model<ListPrice>,
    @InjectModel(Stock.name) private readonly stockModel: Model<Stock>,
  ) {}

  private options = {
    // host: 'rigelec.com.ar',
    host: '10.16.10.16',
    port: 3050,
    database: 'D:\\ETSOL\\PaljetERP\\database\\DBSIF.FDB',
    user: 'SYSDBA',
    password: 'masterkey',
  };

  onModuleInit() {
    this.listenToChanges();
  }

  listenToChanges() {
    firebird.attach(this.options, (err, db) => {
      if (err) {
        console.error('Error connecting to Firebird database:', err);
        return;
      }
      const query = 'SELECT * FROM DB_NOTIF WHERE TABLA_ID IN (1, 214, 88)';
      setInterval(() => {
        try {
          db.query(query, [], (err, result) => {
            if (err) throw err;
            if (result.length > 0 && result.length !== undefined) {
              result.forEach((change) => {
                const CAMPO_ID = change.CAMPO_ID;
                const value = Number(CAMPO_ID.split('=')[1].split(',')[0]);
                switch (change.TABLA_ID) {
                  case 1:
                    db.query(
                      `SELECT ART_ID, DESCRIPCION, EAN, MOD, MED, MARCA_ID FROM ARTICULOS WHERE ART_ID = ${value} AND MARCA_ID IS NOT NULL`,
                      [],
                      (err, result) => {
                        console.log('Articulo desde paljet', result);
                        if (err) throw err;
                        result.forEach((update) => {
                          async () => {
                            const article = await this.articleModel
                              .findOne({
                                _id: update.ART_ID,
                              })
                              .exec();
                            if (article) {
                              article.DESCRIPCION = update.DESCRIPCION;
                              article.EAN = update.EAN;
                              article.MOD = update.MOD;
                              article.MED = update.MED;
                              article.MARCA_ID = update.MARCA_ID;
                              console.log('articulo actualizado', article);
                              article.save();
                            } else {
                              const article = new this.articleModel({
                                _id: update.ART_ID,
                                ART_ID: update.ART_ID,
                                DESCRIPCION: update.DESCRIPCION,
                                EAN: update.EAN,
                                MOD: update.MOD,
                                MED: update.MED,
                                MARCA_ID: update.MARCA_ID,
                              });
                              console.log('nuevo articulo', article);
                            }
                          };
                        });
                      },
                    );
                    break;

                  case 214:
                    console.log(
                      `el articulo ${value} ha tenido movimientos de stock`,
                    );
                    db.query(
                      `SELECT STK_ID, ART_ID, DISPONIBLE FROM STOCK WHERE ART_ID = ${value}`,
                      [],
                      (err, result) => {
                        if (err) throw err;
                        console.log('Stock desde paljet', result);
                        result.forEach((update) => {
                          async () => {
                            const stock = await this.stockModel
                              .findOne({
                                _id: update.STK_ID,
                              })
                              .exec();
                            if (stock) {
                              stock.DISPONIBLE = update.DISPONIBLE;
                              console.log('stock actualizado', stock);
                              stock.save();
                            } else {
                              const stock = new this.stockModel({
                                _id: update.STK_ID,
                                ART_ID: update.ART_ID,
                                DISPONIBLE: update.DISPONIBLE,
                              });
                              console.log('nuevo stock', stock);
                            }
                          };
                        });
                      },
                    );
                    break;

                  case 88:
                    console.log(
                      `el articulo ${value} ha tenido cambios de precio`,
                    );
                    db.query(
                      `SELECT ARTLPR_ID, ART_ID, PR_VTA, PR_FINAL FROM ARTLPR WHERE ART_ID = ${value} AND LISTA_ID = 11`,
                      [],
                      (err, result) => {
                        if (err) throw err;
                        console.log('Precio desde paljet', result);
                        result.forEach((update) => {
                          async () => {
                            const price = await this.listPriceModel
                              .findOne({
                                _id: update.ARTLPR_ID,
                              })
                              .exec();
                            if (price) {
                              price.PR_VTA = update.PR_VTA;
                              price.PR_FINAL = update.PR_FINAL;
                              console.log('precio actualizado', price);
                              price.save();
                            } else {
                              const price = new this.listPriceModel({
                                _id: update.ARTLPR_ID,
                                ART_ID: update.ART_ID,
                                PR_VTA: update.PR_VTA,
                                PR_FINAL: update.PR_FINAL,
                              });
                              console.log('nuevo precio', price);
                            }
                          };
                        });
                      },
                    );
                    break;

                  default:
                    break;
                }
              });
            }
          });
        } catch (err) {
          console.log(err);
        }
      }, 2000);
      // db.detach();
    });
  }
}
