import sharp from 'sharp';

/**
 * Guard against the image optimizer silently falling back to original files.
 *
 *   node scripts/check-image-optimizer.mjs preflight
 *     Checks that sharp loads on the machine that will run the app. This must
 *     run on the VPS, not only on a GitHub runner: sharp's prebuilt binaries
 *     depend on the host CPU (the production QEMU CPU has no AVX2).
 *
 *   node scripts/check-image-optimizer.mjs smoke [baseUrl]
 *     Asks the running Next server for a 128px version of /logo.png and
 *     verifies it is actually resized. /logo.png is 2180px wide natively, so
 *     a broken optimizer returns a much larger image and this fails.
 */

const mode = process.argv[2] || 'preflight';

async function preflight() {
  const source = await sharp({
    create: { width: 48, height: 24, channels: 3, background: { r: 255, g: 0, b: 0 } },
  })
    .png()
    .toBuffer();

  const resized = await sharp(source)
    .resize(16, 8)
    .webp()
    .toBuffer();

  const meta = await sharp(resized).metadata();
  if (!resized.length || meta.width !== 16 || meta.height !== 8) {
    throw new Error(`sharp resize produced unexpected output: ${JSON.stringify(meta)}`);
  }

  console.log(
    `sharp OK (sharp ${sharp.versions.sharp}, libvips ${sharp.versions.vips}, ${process.arch})`,
  );
}

async function smoke() {
  const base = (process.argv[3] || 'http://127.0.0.1:3000').replace(/\/+$/, '');
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const url = `${base}/_next/image?url=%2Flogo.png&w=128&q=75&healthcheck=${nonce}`;

  const res = await fetch(url, {
    headers: {
      accept: 'image/avif,image/webp,image/png,image/*,*/*;q=0.8',
    },
  });

  const body = Buffer.from(await res.arrayBuffer());
  if (!res.ok) {
    throw new Error(`optimizer returned HTTP ${res.status}: ${body.toString('utf8').slice(0, 200)}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    throw new Error(`optimizer returned non-image content-type: ${contentType}`);
  }

  const meta = await sharp(body).metadata();
  if ((meta.width ?? Infinity) > 128 || body.length > 30000) {
    throw new Error(
      `optimizer did not resize: ${meta.width}x${meta.height}, ${body.length} bytes, ${contentType}`,
    );
  }

  console.log(
    `image optimizer OK (${meta.width}x${meta.height}, ${body.length} bytes, ${contentType})`,
  );
}

try {
  if (mode === 'preflight') await preflight();
  else if (mode === 'smoke') await smoke();
  else throw new Error(`unknown mode: ${mode}`);
} catch (error) {
  console.error(`IMAGE OPTIMIZER CHECK FAILED: ${error.message}`);
  process.exit(1);
}
