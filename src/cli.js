const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('wavespeed');
const { listRatios, parseSize, sizeFromRatio } = require('./sizes');

const MODEL = 'wavespeed-ai/z-image/turbo';

function helpText() {
  return `zit - WaveSpeedAI Z-Image-Turbo CLI

Usage:
  zit "a cinematic photo of a cat astronaut"
  zit gen "product photo of a glass perfume bottle" --ratio 4:5 --output ./out
  zit ratios

Options:
  -p, --prompt <text>          Positive prompt. Positional text also works.
  -r, --ratio <ratio>          Common ratio or alias. Default: 1:1.
                              Aliases: square, portrait, landscape, wide, tall, story, reel, poster, photo, ultrawide.
  -s, --size <WIDTHxHEIGHT>    Explicit size. Max width or height: 1536. Overrides --ratio.
  -i, --image <url-or-path>    Reference image URL or local file path. Local files are uploaded first.
  -o, --output <path>          Download output to a directory or file path.
  --format <jpeg|png|webp>     Output format. Default: jpeg.
  --strength <number>          Transformation strength. Default: 0.6.
  --seed <integer>             Seed. Default: -1.
  --sync                       Use WaveSpeed sync mode.
  --base64                     Request base64 output instead of URLs.
  --timeout <seconds>          Max wait time. Default: 36000.
  --poll <seconds>             Poll interval. Default: 1.
  --retries <count>            Task-level retries. Default: 0.
  --api-key <key>              API key. Defaults to WAVESPEED_API_KEY.
  --json                       Print the full result as JSON.
  -h, --help                   Show help.

Environment:
  WAVESPEED_API_KEY            Required unless --api-key is provided.`;
}

function parseArgs(argv) {
  const options = {
    command: 'gen',
    promptParts: [],
    ratio: '1:1',
    outputFormat: 'jpeg',
    strength: 0.6,
    seed: -1,
    enableSyncMode: false,
    enableBase64Output: false,
    timeout: 36000,
    pollInterval: 1,
    maxRetries: 0,
    json: false
  };

  const args = [...argv];
  if (args[0] === 'gen' || args[0] === 'generate' || args[0] === 'ratios') {
    options.command = args.shift() === 'ratios' ? 'ratios' : 'gen';
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = () => {
      index += 1;
      if (index >= args.length) {
        throw new Error(`${arg} requires a value.`);
      }
      return args[index];
    };

    if (arg === '-h' || arg === '--help') {
      options.help = true;
    } else if (arg === '-p' || arg === '--prompt') {
      options.promptParts.push(next());
    } else if (arg === '-r' || arg === '--ratio') {
      options.ratio = next();
    } else if (arg === '-s' || arg === '--size') {
      options.size = next();
    } else if (arg === '-i' || arg === '--image') {
      options.image = next();
    } else if (arg === '-o' || arg === '--output') {
      options.output = next();
    } else if (arg === '--format') {
      options.outputFormat = next();
    } else if (arg === '--strength') {
      options.strength = Number(next());
    } else if (arg === '--seed') {
      options.seed = Number(next());
    } else if (arg === '--timeout') {
      options.timeout = Number(next());
    } else if (arg === '--poll') {
      options.pollInterval = Number(next());
    } else if (arg === '--retries') {
      options.maxRetries = Number(next());
    } else if (arg === '--api-key') {
      options.apiKey = next();
    } else if (arg === '--sync') {
      options.enableSyncMode = true;
    } else if (arg === '--base64') {
      options.enableBase64Output = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      options.promptParts.push(arg);
    }
  }

  options.prompt = options.promptParts.join(' ').trim();
  return options;
}

function validateOptions(options) {
  if (!['jpeg', 'png', 'webp'].includes(options.outputFormat)) {
    throw new Error('--format must be jpeg, png, or webp.');
  }
  if (!Number.isFinite(options.strength) || options.strength < 0) {
    throw new Error('--strength must be a non-negative number.');
  }
  if (!Number.isInteger(options.seed)) {
    throw new Error('--seed must be an integer.');
  }
  if (!Number.isFinite(options.timeout) || options.timeout <= 0) {
    throw new Error('--timeout must be greater than 0.');
  }
  if (!Number.isFinite(options.pollInterval) || options.pollInterval <= 0) {
    throw new Error('--poll must be greater than 0.');
  }
  if (!Number.isInteger(options.maxRetries) || options.maxRetries < 0) {
    throw new Error('--retries must be a non-negative integer.');
  }
  if (options.enableBase64Output && options.output) {
    throw new Error('--base64 cannot be combined with --output because base64 results are not downloadable URLs.');
  }
}

function isProbablyUrl(value) {
  return /^https?:\/\//i.test(value);
}

function extensionFromUrl(url, fallback) {
  try {
    const pathname = new URL(url).pathname;
    const extension = path.extname(pathname).replace(/^\./, '');
    return extension || fallback;
  } catch {
    return fallback;
  }
}

async function resolveImageInput(client, image) {
  if (!image || isProbablyUrl(image) || image.startsWith('data:')) {
    return image;
  }
  return client.upload(path.resolve(image));
}

async function downloadOutput(url, outputPath, index, fallbackFormat) {
  if (!isProbablyUrl(url)) {
    throw new Error('Only URL outputs can be downloaded. Disable --base64 or omit --output.');
  }

  const stats = fs.existsSync(outputPath) ? fs.statSync(outputPath) : null;
  const isDirectory = stats ? stats.isDirectory() : !path.extname(outputPath);
  const extension = extensionFromUrl(url, fallbackFormat);
  const target = isDirectory
    ? path.join(outputPath, `zit-${Date.now()}-${index + 1}.${extension}`)
    : outputPath;

  fs.mkdirSync(path.dirname(path.resolve(target)), { recursive: true });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: HTTP ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(target, buffer);
  return target;
}

function printRatios() {
  console.log('Ratio     Size');
  for (const item of listRatios()) {
    console.log(`${item.ratio.padEnd(9)} ${item.size}`);
  }
}

async function generate(options) {
  validateOptions(options);
  if (!options.prompt && !options.image) {
    throw new Error('Provide a prompt or --image. Run "zit --help" for usage.');
  }

  const dimensions = options.size ? parseSize(options.size) : sizeFromRatio(options.ratio);
  const client = new Client(options.apiKey);
  const image = await resolveImageInput(client, options.image);
  const input = {
    enable_base64_output: options.enableBase64Output,
    output_format: options.outputFormat,
    prompt: options.prompt,
    seed: options.seed,
    size: dimensions.size,
    strength: options.strength
  };

  if (image) {
    input.image = image;
  }

  const result = await client.run(MODEL, input, {
    enableSyncMode: options.enableSyncMode,
    timeout: options.timeout,
    pollInterval: options.pollInterval,
    maxRetries: options.maxRetries
  });

  if (options.json) {
    console.log(JSON.stringify({ model: MODEL, input, result }, null, 2));
  } else {
    console.log(`model: ${MODEL}`);
    console.log(`size: ${dimensions.size}`);
    for (const output of result.outputs || []) {
      console.log(output);
    }
  }

  if (options.output) {
    const outputs = result.outputs || [];
    if (outputs.length === 0) {
      throw new Error('No outputs returned to download.');
    }
    for (let index = 0; index < outputs.length; index += 1) {
      const target = await downloadOutput(outputs[index], options.output, index, options.outputFormat);
      console.error(`saved: ${target}`);
    }
  }
}

async function main(argv) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log(helpText());
    return;
  }
  if (options.command === 'ratios') {
    printRatios();
    return;
  }
  await generate(options);
}

module.exports = {
  MODEL,
  generate,
  helpText,
  main,
  parseArgs,
  validateOptions
};
