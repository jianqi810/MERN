const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const authRoute = require('./Routes').authRoute;
const courseRoute = require('./Routes').courseRoute;
const passport = require('passport');
require('./config/passport')(passport);
const cors = require('cors');

// 連結MongoDB
mongoose
  .connect('mongodb://localhost:27017/MernDB')
  .then(() => {
    console.log('連結到mongodb.....');
  })
  .catch((e) => {
    console.log(e);
  });

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/user', authRoute);
app.use(
  '/api/course',
  passport.authenticate('jwt', { session: false }),
  courseRoute
);

app.listen(8080, () => {
  console.log('後端伺服器正在port 8080.....');
});
