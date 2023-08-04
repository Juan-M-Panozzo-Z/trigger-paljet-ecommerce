import { Injectable, OnModuleInit } from '@nestjs/common';
import * as firebird from 'node-firebird';
import * as fs from 'fs';

@Injectable()
export class FirebirdService implements OnModuleInit {
  private options = {
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
    firebird.attach(this.options, function (err, db) {
      const query = 'SELECT * FROM DB_NOTIF WHERE TABLA_ID IN (1, 214, 88)';
      setInterval(() => {
        try {
          db.query(query, [], function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
              fs.readFile('log.json', function (err, data) {
                if (err) throw err;

                let logObject = {};

                try {
                  logObject = JSON.parse(data.toString());
                } catch (e) {
                  console.log('Error al leer el archivo log.json', e);
                }

                result.forEach((item) => {
                  if (logObject[item.TABLA_ID]) {
                    logObject[item.TABLA_ID].push(item);
                  } else {
                    logObject[item.TABLA_ID] = [item];
                  }
                });

                fs.writeFile(
                  'log.json',
                  JSON.stringify(logObject),
                  function (err) {
                    if (err) throw err;
                    console.log(
                      `Eventos guardados en log.json a las ${new Date()}`,
                    );
                  },
                );
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
