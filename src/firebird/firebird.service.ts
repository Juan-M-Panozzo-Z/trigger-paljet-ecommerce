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
                console.log(value);
                switch (change.TABLA_ID) {
                  case 1:
                    db.query(
                      `SELECT ART_ID, DESCRIPCION, EAN, MOD, MED, MARCA_ID FROM ARTICULOS WHERE ART_ID = ${value} AND MARCA_ID IS NOT NULL`,
                      [],
                      (err, result) => {
                        if (err) throw err;
                        this.articleModel
                          .findOneAndUpdate(
                            { _id: value },
                            {
                              EAN: result[0].EAN,
                              DESCRIPCION: result[0].DESCRIPCION,
                              MOD: result[0].MOD,
                              MED: result[0].MED,
                              MARCA_ID: result[0].MARCA_ID,
                            },
                            { upsert: true },
                          )
                          .then((article) => {
                            if (!article) {
                              const newArticle = new this.articleModel({
                                _id: result[0].ART_ID,
                                EAN: result[0].EAN,
                                DESCRIPCION: result[0].DESCRIPCION,
                                MOD: result[0].MOD,
                                MED: result[0].MED,
                                MARCA_ID: result[0].MARCA_ID,
                              });
                              newArticle.save();
                            }
                          })
                          .catch((err) => {
                            console.log(err);
                          });
                      },
                    );
                    console.log(
                      `el articulo ${value} ha sido creado o modificado`,
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
