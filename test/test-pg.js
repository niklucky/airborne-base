const { PGMapper } = require('../dist/index');
const config = {

};

class MyMapper extends PGMapper {
  constructor() {
    super({}, {}, config, 'users');
  }
}

const my = new MyMapper();
my.load();