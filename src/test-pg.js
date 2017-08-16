import { PostgresMapper } from './index';

const config = {
  database: 'finery'
};

class MyMapper extends PostgresMapper {
  constructor() {
    super({}, {}, config, 'cybo.cybo');
  }
}

const my = new MyMapper();
const SQL = 'SELECT * FROM cybo.cybo WHERE id = 1;';
my.query(SQL, (result) => {
  console.log('result', result);
});

