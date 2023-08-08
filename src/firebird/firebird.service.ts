import { Injectable, OnModuleInit } from '@nestjs/common';
import * as firebird from 'node-firebird';
import * as fs from 'fs';

@Injectable()
export class FirebirdService implements OnModuleInit {
  private options = {
    // host: '10.16.10.16',
    host: 'rigelec.com.ar',
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
              fs.readFile('log.json', (err, data) => {
                if (err) throw err;

                let logArray = [];

                try {
                  logArray = JSON.parse(data.toString());
                } catch (e) {
                  console.log('Error al leer el archivo log.json', e);
                }

                result.forEach((item) => {
                  if (
                    !logArray.find((x) => x.DB_NOTIF_ID === item.DB_NOTIF_ID)
                  ) {
                    logArray.push(item);
                    const tablaId = logArray[0].TABLA_ID;
                    const article = logArray[0].CAMPO_ID.split(',')[0];
                    const type = logArray[0].TIPO_NOVEDAD;
                    console.log(tablaId, article, type);
                  }
                });

                fs.writeFile('log.json', JSON.stringify(logArray), (err) => {
                  if (err) throw err;
                });
              });
            }
          });
        } catch (err) {
          console.log(err);
        }
      }, 100);
    });
  }
}
