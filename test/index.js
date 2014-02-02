var copycat = require('../');
var assert = require('assert');
var request = require('request');
var unlink = require('fs').unlinkSync;
var join = require('path').join;

var url = 'http://localhost:5005';

t('request reply', function(done) {
  copycat('store', function(end) {
    copycat.request({ url: url + '/rand' }, function(err, res, body) {
      assert.equal(body, 'Sun Feb 02 2014 20:18:54 GMT+0200 (EET) 0.10378969390876591');
      assert.equal(res.statusCode, 200);
      done(end());
    });
  });
});

t('recording', function(done) {
  copycat('recording', function(end) {
    copycat.request({ url: url + '/random' }, function(err, res, body) {
      var prev = body;

      end();
      unlink(join(__dirname, 'copycats', 'recording.json'));

      copycat('recording', function(end) {
        copycat.request({ url: url + '/rand' }, function(err, res, body) {
          assert.notEqual(prev, body);

          end();
          unlink(join(__dirname, 'copycats', 'recording.json'));
          done();
        });
      });
    });
  });
});
