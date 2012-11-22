var spawn = require('child_process').spawn,
    gitdiff = null,
    dir = null,
    SHA1 = null,
    SHA2 = null;

function init() {
    // Array starts from the params
    var params = process.argv.splice(2);

    dir = params[0];
    SHA1 = params[1];
    SHA2 = params[2];

    gitdiff = spawn('git', ['diff', SHA1, SHA2]);
}

/*
* MAIN
*/

init();

gitdiff.stdout.on('data', function (data) {
  console.log('* STDOUT:\n'+ data);
});

gitdiff.stderr.on('data', function (data) {
  console.log('* STDERR:\n'+ data);
});

gitdiff.on('exit', function (code) {
  console.log('* Process exited ('+ code +').');
});