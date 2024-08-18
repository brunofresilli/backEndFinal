const bcryptjs = require('bcryptjs');

const createHash = (password) => bcryptjs.hashSync(password, bcryptjs.genSaltSync(10));

const isValidPassword = (user, password) => bcryptjs.compareSync(password, user.password);

module.exports = {
  createHash,
  isValidPassword
};