const express = require('express');
const router = express.Router();
const md5 = require('md5');
const fs = require('fs');
const ImageController = require('../controllers/ImageController');
const StorageController = require('../controllers/StorageController');

function prepareImageSize(reqBody) {
  const imageSize = {
    lg: [null, 600],
    md: [null, 400],
    sm: [null, 150],
  };

  try {
    console.log(reqBody);
    if (reqBody.lg) {
      imageSize.lg = JSON.parse('[' + reqBody.lg + ']');
    }
    if (reqBody.md) {
      imageSize.md = JSON.parse('[' + reqBody.md + ']');
    }
    if (reqBody.sm) {
      imageSize.sm = JSON.parse('[' + reqBody.sm + ']');
    }
    console.log(imageSize);
  } finally {
    return imageSize;
  }
}

router.route('/')

  .get((req, res, next) => {
    res.json({ 'health': 'OK' });
  })
  
  .post((req, res) => {
    const files = req.files && req.files.image;

    if (!files) {
      return res.status(400).json({ status: 'FAILED', message: 'No files uploaded' });
    }

    const imageSize = prepareImageSize(req.body);

    const date = new Date();
    const randomString = (date.getMilliseconds()).toString() + Math.random().toString() + Math.random().toString() + Math.random().toString();
    const folderPath = `${__dirname}/../public/images/`;
    const fileName = md5(randomString) + '.png';

    files.mv(folderPath + fileName, async (err) => {
      if (err)
        return res.status(400).json({ status: 'FAILED', message: 'Error while uploading files' });
      
      try {
        const lg = await ImageController.resize(folderPath, fileName, imageSize.lg[0], imageSize.lg[1], 'lg');
        const md = await ImageController.resize(folderPath, fileName, imageSize.md[0], imageSize.md[1], 'md');
        const sm = await ImageController.resize(folderPath, fileName, imageSize.sm[0], imageSize.sm[1], 'sm');

        // upload to storage
        const storageOri = await StorageController.upload(folderPath + fileName, fileName);
        const storageLg = await StorageController.upload(folderPath + lg, lg);
        const storageMd = await StorageController.upload(folderPath + md, md);
        const storageSm = await StorageController.upload(folderPath + sm, sm);

        // remove from local
        fs.unlinkSync(folderPath + fileName);
        fs.unlinkSync(folderPath + lg);
        fs.unlinkSync(folderPath + md);
        fs.unlinkSync(folderPath + sm);

        return res.json({ 
          status: 'SUCCESS',
          message: 'Files uploaded',
          result: {
            ori: storageOri,
            lg: storageLg,
            md: storageMd,
            sm: storageSm
          }
        });
      } catch(e) {
        console.log(e);
        return res.status(400).json({ status: 'FAILED', message: 'Error while uploading files' });
      }
    });
  });

module.exports = router;
