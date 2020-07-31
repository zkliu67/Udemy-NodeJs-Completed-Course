const fs =require('fs');

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) { throw (err) }
  }) // delete the file at this path
}

exports.deleteFile = deleteFile;