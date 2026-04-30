const test = require('node:test');
const assert = require('node:assert/strict');
const { listRatios, parseSize, sizeFromRatio } = require('../src/sizes');
const { parseArgs, validateOptions } = require('../src/cli');

test('ratio sizes use 1536 as the longest side', () => {
  assert.equal(sizeFromRatio('1:1').size, '1536*1536');
  assert.equal(sizeFromRatio('16:9').size, '1536*864');
  assert.equal(sizeFromRatio('9:16').size, '864*1536');
  assert.equal(sizeFromRatio('3:2').size, '1536*1024');
  assert.equal(sizeFromRatio('2:3').size, '1024*1536');
});

test('ratio aliases are supported', () => {
  assert.equal(sizeFromRatio('wide').size, '1536*864');
  assert.equal(sizeFromRatio('tall').size, '864*1536');
  assert.equal(sizeFromRatio('poster').size, '1024*1536');
});

test('explicit sizes are validated', () => {
  assert.equal(parseSize('1280x720').size, '1280*720');
  assert.throws(() => parseSize('2048x1024'), /1536 or smaller/);
  assert.throws(() => parseSize('abc'), /Invalid size/);
});

test('common ratios all fit within the max side', () => {
  for (const item of listRatios()) {
    assert.ok(item.width <= 1536);
    assert.ok(item.height <= 1536);
    assert.ok(item.width === 1536 || item.height === 1536);
  }
});

test('argument parser accepts positional prompt and generation options', () => {
  const options = parseArgs(['gen', 'hello', 'world', '--ratio', '4:5', '--format', 'png', '--sync']);
  assert.equal(options.command, 'gen');
  assert.equal(options.prompt, 'hello world');
  assert.equal(options.ratio, '4:5');
  assert.equal(options.outputFormat, 'png');
  assert.equal(options.enableSyncMode, true);
});

test('base64 output cannot be combined with file download', () => {
  const options = parseArgs(['hello', '--base64', '--output', './out']);
  assert.throws(() => validateOptions(options), /--base64 cannot be combined/);
});
