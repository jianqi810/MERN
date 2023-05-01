const course = require('../models/course');

const router = require('express').Router();
const Course = require('../models').coureseModel;
const courseValidation = require('../validation').courseValidation;

router.use((req, res, next) => {
  console.log('接收course有關請求');
  next();
});

router.get('/testAPI', (req, res) => {
  return res.send('成功連結course');
});

router.get('/', async (req, res) => {
  try {
    let courseFound = await Course.find({})
      .populate('instructor', ['username', 'email', 'password'])
      .exec();
    return res.send({ msg: '課程獲取成功', courseData: courseFound });
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/:_id', async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id })
      .populate('instructor', ['username', 'email', 'password'])
      .exec();
    return res.send({ msg: '課程獲取成功', courseData: courseFound });
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/student/:_student_id', async (req, res) => {
  let { _student_id } = req.params;
  try {
    let courseFound = await Course.find({ student: _student_id })
      .populate('student', ['username', 'email'])
      .exec();
    return res.send({ msg: '課程獲取成功', courseData: courseFound });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.get('/instructor/:_instructor_id', async (req, res) => {
  let { _instructor_id } = req.params;
  try {
    let courseFound = await Course.find({ instructor: _instructor_id })
      .populate('instructor', ['username', 'email'])
      .exec();
    return res.send({ msg: '課程獲取成功', courseData: courseFound });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.get('/findByName/:name', async (req, res) => {
  let { name } = req.params;
  try {
    let courseFound = await Course.find({ title: name })
      .populate('instructor', ['username', 'email'])
      .exec();
    return res.send({ msg: '課程獲取成功', courseData: courseFound });
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.post('/', async (req, res) => {
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user.isStudent()) {
    return res.status(400).send('只有講師可以發布課程!!');
  }

  let { title, description, price } = req.body;
  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id,
    });
    let saveCourse = await newCourse.save();
    return res.send({ msg: '發布課程成功', data: saveCourse });
  } catch (err) {
    return res.status(400).send('發布課程失敗');
  }
});

router.post('/enroll/:_id', async (req, res) => {
  let { _id } = req.params;
  try {
    let course = await Course.findOne({ _id });
    course.student.push(req.user._id);
    await course.save();
    return res.send({ msg: '發布註冊成功', data: course });
  } catch (err) {
    return res.status(400).send('註冊課程失敗');
  }
});

router.patch('/:_id', async (req, res) => {
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) {
      return res.status(400).send('找不到此課程, 無法更新');
    }
    if (courseFound.instructor.equals(req.user._id)) {
      let updateCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      return res.send({ msg: '課程更新成功', data: updateCourse });
    } else {
      return res.status(403).send('只有講師可以更新課程');
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.delete('/:_id', async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) {
      return res.status(400).send('找不到此課程, 無法刪除');
    }
    if (courseFound.instructor.equals(req.user._id)) {
      let deleteCourse = await Course.deleteOne({ _id }).exec();
      return res.send({ msg: '課程刪除成功', data: deleteCourse });
    } else {
      return res.status(403).send('只有講師可以刪除課程');
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;
