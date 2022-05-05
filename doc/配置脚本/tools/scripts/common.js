
let fs = require("fs");
let path = require("path");

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function (err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function (filename) {
      fs.readFile(dirname + filename, 'utf-8', function (err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
  });
}

function readDir(dirname, onFilenames) {
  fs.readdir(dirname, function (err, filenames) {
    if (err) {
      onError(err);
      return;
    }

    onFilenames(filenames);
  });
}

function writeFileSync(filePath, data) {
  let dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, data, 'utf8');
}

function fileExists(filePath) {
  return fs.existsSync(filePath)
}

function strToStrArray(ref, ...names) {
  names.forEach(name => {
    if (ref[name] != undefined) {
      ref[name] = ref[name].split('+')
    }
  });
}
function strToNumArray(ref, ...names) {
  names.forEach(name => {
    let value = ref[name];
    if (typeof value === 'string' || value instanceof String) {
      let arrStrs = value.split('+');
      let arrNums = [];
      arrStrs.forEach(str => {
        arrNums.push(Number(str));
      });
      ref[name] = arrNums;
    }
    else if (value != undefined) {
      ref[name] = [value];
    }
  });
}

function strToNumArrayPrize(ref, ...names) {
  names.forEach(name => {
    let value = ref[name];
    let newName = name.replace("propnum", "prop");
    let arrNums = [];
    let arrNumss = [];
    if (typeof value === 'string' || value instanceof String) {
      let index = value.indexOf("{") + 1;
      let lastIndex = value.indexOf("}");
      if (index > -1 && lastIndex > -1) {
        let val = value.substring(index, lastIndex);
        let vals = value.substring(lastIndex + 2);
        let arrStrs = vals.split('+');
        arrNums.push(3);
        arrStrs.forEach(str => {
          arrNums.push(Number(str));
        });

        arrStrs = val.split('+');
        arrStrs.forEach(str => {
          arrNumss.push(Number(str));
        });

      } else {
        let arrStrs = value.split('+');
        arrStrs.forEach(str => {
          arrNums.push(Number(str));
        });
      }
      ref[name] = arrNums;
      ref[newName] = arrNumss;
    }
    else if (value != undefined) {
      ref[name] = [value];
    }
  });
}

function strToAnyArray(ref, ...names) {
  names.forEach(name => {
    let value = ref[name];
    if (typeof value === 'string' || value instanceof String) {
      let arrStrs = value.split('+');
      let arrAny = [];
      arrStrs.forEach(str => {
        let num = Number(str);
        if (isNaN(num)) {
          arrAny.push(str)
        }
        else {
          arrAny.push(num);
        }
      });
      ref[name] = arrAny;
    }
    else if (value != undefined) {
      ref[name] = [value];
    }
  });
}

function splitString(str, sep = '+') {
  return str.split(sep)
}

function setUnDefinedValue(ref, defaultValue, ...names) {
  names.forEach(name => {
    if (ref[name] == undefined) {
      ref[name] = defaultValue;
    }
  });
}

exports.readFiles = readFiles;
exports.readDir = readDir;
exports.writeFileSync = writeFileSync;
exports.fileExists = fileExists;
exports.splitString = splitString;
exports.strToStrArray = strToStrArray;
exports.strToNumArray = strToNumArray;
exports.strToNumArrayPrize = strToNumArrayPrize;
exports.setUnDefinedValue = setUnDefinedValue;
exports.strToAnyArray = strToAnyArray;
