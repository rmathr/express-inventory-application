const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const RateLimit = require('express-rate-limit');

dotenv.config();
mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGODB_URL;
const PORT = process.env.PORT || 3000;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

const indexRouter = require('./routes/index');
const catalogRouter = require('./routes/catalog');

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);

app.use(helmet());

app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', indexRouter);
app.use('/catalog', catalogRouter);

app.listen(PORT);

module.exports = app;
