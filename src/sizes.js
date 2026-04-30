const MAX_SIDE = 1536;
const MIN_SIDE = 64;
const MULTIPLE = 8;

const RATIO_ALIASES = new Map([
  ['square', '1:1'],
  ['portrait', '3:4'],
  ['landscape', '4:3'],
  ['wide', '16:9'],
  ['tall', '9:16'],
  ['story', '9:16'],
  ['reel', '9:16'],
  ['phone', '9:16'],
  ['poster', '2:3'],
  ['photo', '3:2'],
  ['ultrawide', '21:9']
]);

const COMMON_RATIOS = [
  '1:1',
  '16:9',
  '9:16',
  '4:3',
  '3:4',
  '3:2',
  '2:3',
  '5:4',
  '4:5',
  '21:9',
  '9:21',
  '2:1',
  '1:2'
];

function roundToMultiple(value) {
  return Math.max(MIN_SIDE, Math.round(value / MULTIPLE) * MULTIPLE);
}

function parsePositiveInteger(value, name) {
  if (!/^\d+$/.test(String(value))) {
    throw new Error(`${name} must be a positive integer.`);
  }
  const number = Number(value);
  if (number < MIN_SIDE) {
    throw new Error(`${name} must be at least ${MIN_SIDE}.`);
  }
  if (number > MAX_SIDE) {
    throw new Error(`${name} must be ${MAX_SIDE} or smaller.`);
  }
  return number;
}

function normalizeRatio(ratio) {
  const value = String(ratio || '1:1').trim().toLowerCase();
  const normalized = RATIO_ALIASES.get(value) || value.replace(/[x*]/, ':');
  const match = normalized.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (!match) {
    throw new Error(`Invalid ratio "${ratio}". Use values like 1:1, 16:9, 3:4, wide, or tall.`);
  }

  const widthPart = Number(match[1]);
  const heightPart = Number(match[2]);
  if (widthPart <= 0 || heightPart <= 0) {
    throw new Error('Ratio values must be greater than 0.');
  }
  return { label: `${match[1]}:${match[2]}`, widthPart, heightPart };
}

function sizeFromRatio(ratio = '1:1') {
  const parsed = normalizeRatio(ratio);
  let width;
  let height;

  if (parsed.widthPart >= parsed.heightPart) {
    width = MAX_SIDE;
    height = roundToMultiple(MAX_SIDE * (parsed.heightPart / parsed.widthPart));
  } else {
    height = MAX_SIDE;
    width = roundToMultiple(MAX_SIDE * (parsed.widthPart / parsed.heightPart));
  }

  return {
    width,
    height,
    size: `${width}*${height}`,
    ratio: parsed.label
  };
}

function parseSize(value) {
  const match = String(value || '').trim().toLowerCase().match(/^(\d+)\s*[x*]\s*(\d+)$/);
  if (!match) {
    throw new Error('Invalid size. Use WIDTHxHEIGHT, for example 1536x864.');
  }

  const width = parsePositiveInteger(match[1], 'Width');
  const height = parsePositiveInteger(match[2], 'Height');
  return {
    width,
    height,
    size: `${width}*${height}`,
    ratio: `${width}:${height}`
  };
}

function listRatios() {
  return COMMON_RATIOS.map((ratio) => {
    const dimensions = sizeFromRatio(ratio);
    return { ratio, size: dimensions.size, width: dimensions.width, height: dimensions.height };
  });
}

module.exports = {
  COMMON_RATIOS,
  MAX_SIDE,
  listRatios,
  normalizeRatio,
  parseSize,
  sizeFromRatio
};
