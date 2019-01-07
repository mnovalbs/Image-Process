const sharp = require('sharp');

function resize(path, file_name, w, h, prefix='resized') {
  return new Promise((resolve, reject) => {
    const newName = prefix + '-' + file_name;
    sharp(path + file_name)
      .resize(w, h)
      .toFile(path + newName, err => {
        if (err) {
          reject(err);
        } else {
          resolve(newName);
        }
      });
  });
}

module.exports = {
  resize: resize,
};