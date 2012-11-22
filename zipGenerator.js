var spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    fs = require('fs'),
    program = require('commander'),
    gitdiff = null,
    dir = null,
    SHA1 = null,
    SHA2 = null,
    currentScriptDir = process.cwd(),
    diffSaveDir = '/diffs';


    program
      .version(JSON.parse(fs.readFileSync(__dirname +'/package.json', 'utf8')).version)
      .option('Posteimpresa Git dir', 'specify the port Posteimpresa git repository directory', String)
      .option('SHA1', 'specify the first Git SHA Hash', Number)
      .option('SHA2', 'specify the second Git SHA Hash', Number)
      .parse(process.argv);

    // program
    //   .command('dozip [dir]')
    //   .description('Creates the ZIP with the DIFF file, using the two hashtags')
    //   .action(function(dir) {
    //     console.log(dir +' '+ SHA1 +' '+ SHA2);
    //   });

// check if directory exists
function dirExistsSync(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch (err) {
    return false;
  }
}

function initDiffDir() {
  // create diffSaveDir if does not exists
  if (!dirExistsSync(diffSaveDir)) {
    fs.mkdir(diffSaveDir, function(err) {
      if (err) {
        console.log('initDiffDir ERR:'+ err);
      }
    });
  } else {
    // if exists remove all directory contents
    child = exec('rm -Rf '+ diffSaveDir +'/*');
  }
}

function saveDiff(diffData) {
  fs.writeFile(currentScriptDir +''+ diffSaveDir +'/diff.txt', diffData, 'binary', function(err) {
    if (err) {
      console.log('saveDiff ERR:'+ err);
    }
  });
}

function changeDir(dir) {
  console.log('* Starting directory: ' + process.cwd());
  try {
    process.chdir(dir);
    console.log('* New directory: ' + process.cwd());
  }
  catch (err) {
    console.log('* chdir ERR: ' + err);
  }
}

function init() {
  // Array starts from the params
  var params = process.argv.splice(2);

  dir = params[0];
  SHA1 = params[1];
  SHA2 = params[2];

  initDiffDir();
  changeDir(dir);
  gitdiff = spawn('git', ['diff', '--name-only', SHA1, SHA2]);
}

/*
* MAIN
*/

init();

gitdiff.stdout.on('data', function (data) {
  diffData = SHA1 +' '+ SHA2 +'\n\n'+ data;
  console.log('* DIFFS *\n'+ diffData);

  saveDiff(diffData);
});

gitdiff.stderr.on('data', function (data) {
  console.log('* STDERR:\n'+ data);
});

gitdiff.on('exit', function (code) {
  console.log('* Process exited ('+ code +').');
});