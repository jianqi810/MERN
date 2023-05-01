const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  username: {
    type: String,
    require: true,
    minLength: 3,
    maxLength: 10,
  },
  email: {
    type: String,
    require: true,
    minLength: 6,
    maxLength: 50,
  },
  password: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    enum: ['student', 'instructor'],
    require: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// 使用者 methods
userSchema.methods.isStudent = function () {
  return this.role == 'student';
};
userSchema.methods.isInstructor = function () {
  return this.role == 'instructor';
};

userSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (error) {
    return cb(error, result);
  }
};

// mongoose middlewares
// 若使用者是新用戶或正在更改密碼, 則將密碼做hash
userSchema.pre('save', async function (next) {
  if (this.New || this.isModified('password')) {
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
