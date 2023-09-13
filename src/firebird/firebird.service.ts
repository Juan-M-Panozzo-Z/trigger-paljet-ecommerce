import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as firebird from 'node-firebird';
import { Model } from 'mongoose';
import { Event } from './models/event.model';
import { Article } from 'src/paljet-sync/models/article.model';
import { Stock } from 'src/paljet-sync/models/stock.model';
import { ListPrice } from 'src/paljet-sync/models/listPrice.model';
import { retryWhen, delay, take } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class FirebirdService implements OnModuleInit {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
    @InjectModel(Stock.name) private readonly stockModel: Model<Stock>,
    @InjectModel(ListPrice.name)
    private readonly listPriceModel: Model<ListPrice>,
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
    this.watchEvents();
  }

  listenToChanges() {
    this.connectToFirebird();
  }

  connectToFirebird() {
    firebird.attach(this.options, (err, db) => {
      if (err) {
        console.error('Error connecting to Firebird database:', err);
        this.retryConnection();
        return;
      }
      console.log('Connected to Firebird database.');

      const query = 'SELECT * FROM DB_NOTIF WHERE TABLA_ID IN (1, 88, 214)';
      setInterval(() => {
        try {
          db.query(query, [], (err, events) => {
            if (err) throw err;
            events.forEach(async (event) => {
              const existingEvent = await this.eventModel.findOne({
                TRANSACTION_ID: event.TRANSACTION_ID,
              });
              if (!existingEvent) {
                const newEvent = new this.eventModel(event);
                newEvent.save();
              }
            });
          });
        } catch (error) {
          console.error('Error querying Firebird database:', error);
        }
      }, 500);
    });
  }

  retryConnection() {
    console.log('Connection to Firebird lost. Retrying...');
    of(null)
      .pipe(
        delay(50),
        take(1000),
        retryWhen((errors) => errors),
      )
      .subscribe(() => {
        console.log('Retrying connection to Firebird...');
        this.connectToFirebird();
      });
  }

  async watchEvents() {
    const changeStream = this.eventModel.watch();

    changeStream.on('change', async (change) => {
      if (change.operationType === 'insert') {
        const newEvent = change.fullDocument;
        const value = Number(newEvent.CAMPO_ID.split('=')[1].split(',')[0]);
        switch (newEvent.TABLA_ID) {
          case 1:
            const articleQuery = `SELECT ART_ID, DESCRIPCION, COD_ART, EAN, MOD, MED, URL_ARCHIVO, MARCA_ID FROM ARTICULOS WHERE ART_ID = ${value} AND MARCA_ID IS NOT NULL`;
            firebird.attach(this.options, (err, db) => {
              if (err) throw err;
              db.query(articleQuery, [], async (err, article) => {
                if (err) throw err;
                if (article.length > 0) {
                  const existingArticle = await this.articleModel.findOne({
                    _id: article[0].ART_ID,
                  });
                  if (existingArticle) {
                    await this.articleModel.updateOne(
                      { _id: article[0].ART_ID },
                      {
                        DESCRIPCION: article[0].DESCRIPCION,
                        COD_ART: article[0].COD_ART,
                        EAN: article[0].EAN,
                        MOD: article[0].MOD,
                        MED: article[0].MED,
                        URL_ARCHIVO: article[0].URL_ARCHIVO,
                        MARCA_ID: article[0].MARCA_ID,
                      },
                    );
                  } else {
                    const newArticle = new this.articleModel({
                      _id: article[0].ART_ID,
                      DESCRIPCION: article[0].DESCRIPCION,
                      COD_ART: article[0].COD_ART,
                      EAN: article[0].EAN,
                      MOD: article[0].MOD,
                      MED: article[0].MED,
                      URL_ARCHIVO: article[0].URL_ARCHIVO,
                      MARCA_ID: article[0].MARCA_ID,
                    });
                    newArticle.save();
                  }
                  console.log(
                    'Artículo actualizado a las',
                    new Date().toLocaleString(),
                  );
                }
              });
            });
            break;
          case 88:
            const listPriceQuery = `SELECT ARTLPR_ID, ART_ID, PR_VTA, PR_FINAL FROM ARTLPR WHERE ARTLPR_ID = ${value} AND LISTA_ID = 11`;
            firebird.attach(this.options, (err, db) => {
              if (err) throw err;
              db.query(listPriceQuery, [], async (err, listPrice) => {
                if (err) throw err;
                if (listPrice.length > 0) {
                  const existingListPrice = this.listPriceModel.findOne({
                    ARTLPR_ID: listPrice[0].ARTLPR_ID,
                  });
                  if (existingListPrice) {
                    await this.listPriceModel.updateOne(
                      { _id: listPrice[0].ARTLPR_ID },
                      {
                        ART_ID: listPrice[0].ART_ID,
                        PR_VTA: listPrice[0].PR_VTA,
                        PR_FINAL: listPrice[0].PR_FINAL,
                      },
                    );
                  } else {
                    const newListPrice = new this.listPriceModel({
                      _id: listPrice[0].ARTLPR_ID,
                      ART_ID: listPrice[0].ART_ID,
                      PR_VTA: listPrice[0].PR_VTA,
                      PR_FINAL: listPrice[0].PR_FINAL,
                    });
                    newListPrice.save();
                  }
                  console.log(
                    'Lista de precios actualizada a las',
                    new Date().toLocaleString(),
                  );
                }
              });
            });
            break;
          case 214:
            const stockQuery = `SELECT STK_ID, ART_ID, DISPONIBLE FROM STOCK WHERE ART_ID = ${value}`;
            firebird.attach(this.options, (err, db) => {
              if (err) throw err;
              db.query(stockQuery, [], async (err, stock) => {
                if (err) throw err;
                if (stock.length > 0) {
                  const existingStock = this.stockModel.findOne({
                    ART_ID: stock[0].ART_ID,
                  });
                  if (existingStock) {
                    await this.stockModel.updateOne({
                      DISPONIBLE: stock[0].DISPONIBLE,
                    });
                  } else {
                    const newStock = new this.stockModel({
                      _id: stock[0].STK_ID,
                      ART_ID: stock[0].ART_ID,
                      DISPONIBLE: stock[0].DISPONIBLE,
                    });
                    newStock.save();
                  }
                  console.log(
                    'Stock actualizado a las',
                    new Date().toLocaleString(),
                  );
                }
              });
            });
            break;
        }
      }
    });

    changeStream.on('error', (error) => {
      console.error('Change stream error:', error);
    });
  }
}
