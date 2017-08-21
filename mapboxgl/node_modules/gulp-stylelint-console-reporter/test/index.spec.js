import test from 'tape';
import gulpUtil from 'gulp-util';
import {stub} from 'sinon';

import consoleReporter from '../src';

test('initializer should return a function', function (t) {
  t.plan(1);
  t.equal('function', typeof consoleReporter());
});

test('reporter should skip empty messages', function (t) {
  stub(gulpUtil, 'log');
  t.plan(1);

  const reporter = consoleReporter();

  reporter([{
    messages: []
  }]);

  t.false(gulpUtil.log.called, 'should not log anything');
  gulpUtil.log.restore();
});

test('reporter should skip non-stylelint messages', function (t) {
  stub(gulpUtil, 'log');
  t.plan(2);

  const reporter = consoleReporter();

  reporter([{
    messages: [{
      plugin: 'another-plugin',
      text: 'some error'
    }],
    opts: {
      from: 'foo.js'
    }
  }]);

  t.true(gulpUtil.log.calledOnce, 'should only log once');
  t.true(gulpUtil.log.firstCall.args[0].includes('foo.js'), 'should only log file name');
  gulpUtil.log.restore();
});

test('reporter should log file names and messages', function (t) {
  stub(gulpUtil, 'log');
  t.plan(3);

  const reporter = consoleReporter();

  reporter([{
    messages: [{
      plugin: 'stylelint',
      line: 0,
      column: 0,
      text: 'first error'
    }, {
      plugin: 'stylelint',
      line: 0,
      column: 0,
      text: 'second error'
    }],
    opts: {
      from: 'foo.js'
    }
  }]);

  t.true(gulpUtil.log.firstCall.args[0].includes('foo.js'), 'should log file name');
  t.true(gulpUtil.log.secondCall.args[0].includes('first error'), 'should log first message');
  t.true(gulpUtil.log.thirdCall.args[0].includes('second error'), 'should log second message');
  gulpUtil.log.restore();
});
