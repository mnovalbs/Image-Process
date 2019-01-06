const express = require('express');
const router = express.Router();
const md5 = require('md5');
const ImageController = require('../controllers/ImageController');

router.route('/')

  .get((req, res, next) => {
    res.render('index', { title: 'Express' });
  })
  
  .post((req, res) => {
    const files = req.files.image;

    if (!files) {
      return res.status(400).json({ status: 'FAILED', message: 'No files uploaded' });
    }

    const date = new Date();
    const randomString = (date.getMilliseconds()).toString() + Math.random().toString() + Math.random().toString() + Math.random().toString();
    const folderPath = `${__dirname}/../public/images/`;
    const fileName = md5(randomString) + '.png';

    files.mv(folderPath + fileName, async (err) => {
      if (err)
        return res.status(400).json({ status: 'FAILED', message: 'Error while uploading files' });
      
      try {
        const lg = await ImageController.resize(folderPath, fileName, 500, 300);
        const md = await ImageController.resize(folderPath, fileName, 300, 200);
        const sm = await ImageController.resize(folderPath, fileName, 150, 150);

        return res.json({ status: 'SUCCESS', message: 'Files uploaded', result: { ori: fileName, lg, md, sm } });
      } catch(e) {
        console.log(e);
        return res.status(400).json({ status: 'FAILED', message: 'Error while uploading files' });
      }
    });
  });

module.exports = router;
