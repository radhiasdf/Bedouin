// Simple Perlin Noise Generator (Ken Perlin-inspired)
export function generatePerlinTexture(scene, key = 'perlinMask', width = 700, height = 128) {
    const canvas = scene.textures.createCanvas(key, width, height).getSourceImage();
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Generate base noise
    const base = [];
    for (let y = 0; y < height; y++) {
        base[y] = [];
        for (let x = 0; x < width; x++) {
            base[y][x] = Math.random();
        }
    }

    // Smooth interpolation function
    function interpolate(a, b, t) {
        return a * (1 - t) + b * t;
    }

    // Generate value noise (low-frequency)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const xi = Math.floor(x / 8);
            const yi = Math.floor(y / 8);

            const xf = (x % 8) / 8;
            const yf = (y % 8) / 8;

            const top = interpolate(
                base[yi % height][xi % width],
                base[yi % height][(xi + 1) % width],
                xf
            );
            const bottom = interpolate(
                base[(yi + 1) % height][xi % width],
                base[(yi + 1) % height][(xi + 1) % width],
                xf
            );
            const value = interpolate(top, bottom, yf);

            const val = Math.floor(value * 255);
            const idx = (y * width + x) * 4;
            data[idx] = val;
            data[idx + 1] = val;
            data[idx + 2] = val;
            data[idx + 3] = val;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    scene.textures.get(key).refresh();
}
