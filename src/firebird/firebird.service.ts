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
            if (result.length > 0) {
              result.forEach((change) => {
                const CAMPO_ID = change.CAMPO_ID;
                const value = CAMPO_ID.split('=')[1].split(',')[0];
                switch (change.TABLA_ID) {
                  case 1:
                    db.query(
                      `SELECT COD_ART, DESCRIPCION, EAN, MOD, MED, MARCA_ID FROM ARTICULOS WHERE ART_ID = ${value} AND MARCA_ID IS NOT NULL`,
                      [],
                      (err, result) => {
                        if (err) throw err;
                        console.log(
                          `el articulo ${value} ha sido creado o modificado`,
                        );
                        this.articleModel
                          .findOne({ _id: result[0].COD_ART })
                          .then((existingArticle) => {
                            if (!existingArticle) {
                              const newArticle = new this.articleModel({
                                _id: result[0].COD_ART,
                                DESCRIPCION: result[0].DESCRIPCION,
                                EAN: result[0].EAN,
                                MOD: result[0].MOD,
                                MED: result[0].MED,
                                MARCA_ID: result[0].MARCA_ID,
                              });
                              newArticle.save();
                            } else {
                              this.articleModel.updateOne(
                                { _id: result[0].COD_ART },
                                { ...result[0] },
                              );
                            }
                          });
                      },
                    );
                    break;
                  case 214:
                    db.query(
                      `SELECT * FROM STOCK WHERE ART_ID = ${value}`,
                      [],
                      (err, result) => {
                        if (err) throw err;
                        console.log(
                          `el articulo ${value} tiene ${result[0].DISPONIBLE} unidades en stock`,
                        );
                        this.stockModel
                          .findOne({ _id: value })
                          .then((existingStock) => {
                            if (!existingStock) {
                              console.log(result);
                            } else {
                              this.stockModel.updateOne(
                                { _id: value },
                                { DISPONIBLE: result[0].DISPONIBLE },
                              );
                            }
                          });
                      },
                    );

                    break;
                  case 88:
                    console.log(
                      `el precio del articulo ${value} ha creado creado o modificado`,
                    );
                    // db.query(
                    //   `SELECT _id, ART_ID, PR_VTA, PR_FINAL FROM ARTLPR WHERE ART_ID = ${value}`,
                    //   [],
                    //   (err, result) => {
                    //     if (err) throw err;
                    //     console.log(result);
                    //     this.listPriceModel
                    //       .findOne({ _id: result[0]._id })
                    //       .then((existingListPrice) => {
                    //         if (!existingListPrice) {
                    //           const newListPrice = new this.listPriceModel({
                    //             ...result[0],
                    //           });
                    //           newListPrice.save();
                    //         } else {
                    //           this.listPriceModel.updateOne(
                    //             { _id: result[0]._id },
                    //             { ...result[0] },
                    //           );
                    //         }
                    //       });
                    //   },
                    // );

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
      db.detach();
    });
  }
}
