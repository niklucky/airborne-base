const { MySQLMapper } = require('../dist/index');
const DI = require('./di');
const config = require('./config');

const di = new DI();
const connection = { mysql: {} };

function next() {
  const mapper2 = new MySQLMapper(di, connection, config.db.mysql, config.sources.test);
  mapper2.load({ id: 1 }).then((users) => {
    console.log('users', users);
    mapper2.load({ id: 2 }).then((u) => {
      console.log('u', u);
    });
  });
}

const mapper = new MySQLMapper(di, connection, config.db.mysql, config.sources.test);
mapper.load({ id: 1 }).then((users) => {
  console.log('users', users);
  mapper.load({ id: 2 }).then((u) => {
    console.log('u', u);
    next();
  });
});
