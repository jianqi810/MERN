const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const registerValidation = require('../validation').registerValidation;
const loginValidation = require('../validation').loginValidation;
const User = require('../models').userModel;

router.use((req, res, next) => {
  console.log('接收auth有關請求');
  next();
});

router.get('/testAPI', (req, res) => {
  return res.send('成功連結auth');
});

router.post('/register', async (req, res) => {
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send('信箱已經註冊過了!!');

  let { username, email, password, role } = req.body;
  let newUser = new User({ username, email, password, role });
  try {
    let saveUser = await newUser.save();
    return res.send({ msg: '使用者註冊成功!!', data: saveUser });
  } catch (err) {
    console.log(err);
    return res.status(500).send('註冊使用者失敗!!');
  }
});

router.post('/login', async (req, res) => {
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    return res.status(400).send('無法找到使用者!!');
  }
  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (error) return res.status(500).send(err);

    if (isMatch) {
      // 製作JWT
      const tokenObj = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObj, process.env.PASSPORT_SECRET);
      return res.send({
        msg: '登入成功',
        token: 'JWT ' + token,
        user: foundUser,
      });
    } else {
      return res.status(401).send('密碼錯誤!!');
    }
  });
});

module.exports = router;
