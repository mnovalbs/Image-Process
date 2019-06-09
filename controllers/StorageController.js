const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
const bucketName = 'assets.keluargalangit.com';

const upload = async (filePath, fileName) => {
  try {
    await storage.bucket(bucketName).upload(filePath);
    await makePublic(fileName);
    return fileName;
  } catch (e) {
    return false;
  }
}

const makePublic = async (fileName) => {
  try {
    await storage.bucket(bucketName).file(fileName).makePublic();
    return fileName;
  } catch (e) {
    return false
  }
}

module.exports = {
  upload
}