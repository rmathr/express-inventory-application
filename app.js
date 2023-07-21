require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');

mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGODB_URL;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

const indexRouter = require('./routes/index');
const catalogRouter = require('./routes/catalog'); //Import routes for "catalog" area of site

// console.log(process.env.MONGODB_URL);
// app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
// app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.get('/', (req, res) => {
//   res.render('index');
// });
app.use('/', indexRouter);
app.use('/catalog', catalogRouter);

app.listen(3000);

module.exports = app;
