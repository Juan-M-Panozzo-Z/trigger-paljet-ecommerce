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
    host: 'rigelec.com.ar',
    // host: '10.16.10.16',
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
                        if (err) throw err;
                        console.log('Articulo desde paljet', result);
                        const updateArticle = async () => {
                          const article = await this.articleModel
                            .findOne({
                              _id: value,
                            })
                            .exec();
                          if (article) {
                            article.DESCRIPCION = result[0].DESCRIPCION;
                            article.EAN = result[0].EAN;
                            article.MOD = result[0].MOD;
                            article.MED = result[0].MED;
                            article.MARCA_ID = result[0].MARCA_ID;
                            console.log('articulo actualizado', article);
                            article.save();
                          } else {
                            const article = new this.articleModel({
                              _id: result[0].ART_ID,
                              ART_ID: result[0].ART_ID,
                              DESCRIPCION: result[0].DESCRIPCION,
                              EAN: result[0].EAN,
                              MOD: result[0].MOD,
                              MED: result[0].MED,
                              MARCA_ID: result[0].MARCA_ID,
                            });
                            console.log('nuevo articulo', article);
                          }
                        };
                        updateArticle();
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
                        const updateStock = async () => {
                          const stock = await this.stockModel
                            .findOne({
                              ART_ID: value,
                            })
                            .exec();
                          if (stock) {
                            stock.DISPONIBLE = result[0].DISPONIBLE;
                            console.log('stock actualizado', stock);
                            stock.save();
                          } else {
                            const stock = new this.stockModel({
                              _id: result[0].STK_ID,
                              ART_ID: result[0].ART_ID,
                              DISPONIBLE: result[0].DISPONIBLE,
                            });
                            console.log('nuevo stock', stock);
                          }
                        };
                        updateStock();
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
                        const updatePrice = async () => {
                          const price = await this.listPriceModel
                            .findOne({
                              ART_ID: value,
                            })
                            .exec();
                          if (price) {
                            price.PR_VTA = result[0].PR_VTA;
                            price.PR_FINAL = result[0].PR_FINAL;
                            console.log('precio actualizado', price);
                            price.save();
                          } else {
                            const price = new this.listPriceModel({
                              _id: result[0].ARTLPR_ID,
                              ART_ID: result[0].ART_ID,
                              PR_VTA: result[0].PR_VTA,
                              PR_FINAL: result[0].PR_FINAL,
                            });
                            console.log('nuevo precio', price);
                          }
                        };
                        updatePrice();
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
