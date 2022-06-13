const bcrypt = require('bcrypt');

module.exports = {
  encryptPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    const newPass = await bcrypt.hash(password, salt);

    return newPass;
  },
  matchPassword: async (password, dbPassword) => {
    return await bcrypt.compare(password, dbPassword);
  }
};
