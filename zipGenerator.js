var fs = require('fs'),
    asynch = require('async'),
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    program = require('commander'),
    gitdiff = null,
    repositoryDir = null,
    SHA1 = null,
    SHA2 = null,
    currentScriptDir = process.cwd(),
    diffSaveDir = currentScriptDir +'/diffs',
    outputDir = currentScriptDir +'/output',
    zipName = 'OutputZipName',
    version = null,
    date = new Date(),
    formattedDate = date.getUTCFullYear() +''+ (date.getUTCMonth()+1) +''+ date.getUTCDate() +'_'+ date.getUTCMilliseconds(), // TODO: remove milliseconds
    finalZipName = null;

    program
      .version(JSON.parse(fs.readFileSync(__dirname +'/package.json', 'utf8')).version)
      .option('Git dir', 'specify the ABSOLUTE git repository path', String)
      .option('SHA1', 'specify the first Git SHA Hash', Number)
      .option('SHA2', 'specify the second Git SHA Hash', Number)
      .option('version', 'specify the ZIP version', Number, 1)
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
    return fs.statSynch(dir).isDirectory();
  } catch (err) {
    return false;
  }
}

// function initDiffDir() {
  // create diffSaveDir if does not exists
  // if (!dirExistsSync(diffSaveDir)) {
  //   console.log('current dir: '+ process.cwd());
  //   console.log('saving dir: '+ diffSaveDir);


  //   fs.mkdir(process.cwd() +''+ diffSaveDir, function(err) {
  //     if (err) {
  //       throw err;
  //     }
  //   });
  // } else {
    // if exists remove all directory contents
    // child = exec('rm -Rf '+ currentScriptDir +''+ diffSaveDir +'/*');
  // }
// }

function saveDiff(diffData) {
  fs.writeFile(diffSaveDir +'/DIFF-'+ finalZipName +'.txt', diffData, 'binary', function(err) {
    if (err) {
      throw err;
    }
  });
}

function changeDir(dir) {
  // console.log('* Starting directory: ' + process.cwd());
  try {
    process.chdir(dir);
    // console.log('* New directory: ' + process.cwd());
  }
  catch (err) {
    // console.log('* chdir ERR: ' + err);
    throw err;
  }
}

function init() {
  // Array starts from the params
  var params = process.argv.splice(2);

  repositoryDir = params[0];
  SHA1 = params[1];
  SHA2 = params[2];
  version = params[3] || 1;

  finalZipName = zipName +''+ formattedDate +'_'+ version;

  // initDiffDir();
  // Remove old files
  exec('rm -Rf '+ diffSaveDir +'/*');
  exec('rm -Rf '+ outputDir +'/*');

  changeDir(repositoryDir);
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

  exec('cp -R '+ repositoryDir +'/_site/ '+ outputDir +'/'+ finalZipName);
  exec('cp '+ diffSaveDir +'/DIFF-'+ finalZipName +'.txt '+ outputDir +'/DIFF-'+ finalZipName +'.txt');

  var netBeansDir = outputDir +'/'+ finalZipName +'/nbproject';
  // if (dirExistsSync(netBeansDir)) {
    exec('rm -Rf '+ netBeansDir);
  // }
});

gitdiff.stderr.on('data', function(data) {
  console.log('* STDERR:\n'+ data);
});

gitdiff.on('exit', function(code) {
  console.log('* Process exited ('+ code +').');
});