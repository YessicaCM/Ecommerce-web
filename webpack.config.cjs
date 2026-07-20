const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    app: './js/app.js',
    login: './js/login.js',
    admin: './js/admin.js',
    perfil: './js/perfil.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
};