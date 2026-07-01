#!/usr/bin/env python3
"""Generate square PWA icons from logo.PNG using only the stdlib (zlib).

Decodes the source PNG, composites it (aspect-preserved, centred) onto a
solid on-brand background, and writes out the icon sizes a PWA needs.
"""
import struct
import zlib

BRAND_RED = (232, 68, 59)      # matches the monzo card / logo badge
NAVY = (16, 20, 31)            # app background

def read_png(path):
    with open(path, "rb") as f:
        data = f.read()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", "not a PNG"
    pos = 8
    width = height = bit_depth = color_type = None
    idat = b""
    palette = None
    trns = None
    while pos < len(data):
        length = struct.unpack(">I", data[pos:pos + 4])[0]
        ctype = data[pos + 4:pos + 8]
        chunk = data[pos + 8:pos + 8 + length]
        if ctype == b"IHDR":
            width, height, bit_depth, color_type = struct.unpack(">IIBB", chunk[:10])
        elif ctype == b"PLTE":
            palette = chunk
        elif ctype == b"tRNS":
            trns = chunk
        elif ctype == b"IDAT":
            idat += chunk
        elif ctype == b"IEND":
            break
        pos += 12 + length
    assert bit_depth == 8, f"only 8-bit supported, got {bit_depth}"
    raw = zlib.decompress(idat)

    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color_type]
    stride = width * channels
    pixels = bytearray()
    prev = bytearray(stride)
    p = 0
    for _ in range(height):
        ftype = raw[p]; p += 1
        line = bytearray(raw[p:p + stride]); p += stride
        for i in range(stride):
            a = line[i - channels] if i >= channels else 0
            b = prev[i]
            c = prev[i - channels] if i >= channels else 0
            x = line[i]
            if ftype == 1:
                x += a
            elif ftype == 2:
                x += b
            elif ftype == 3:
                x += (a + b) // 2
            elif ftype == 4:
                pp = a + b - c
                pa, pb, pc = abs(pp - a), abs(pp - b), abs(pp - c)
                x += a if pa <= pb and pa <= pc else (b if pb <= pc else c)
            line[i] = x & 0xFF
        pixels.extend(line)
        prev = line

    # Normalise to RGBA
    rgba = bytearray(width * height * 4)
    for i in range(width * height):
        if color_type == 6:
            r, g, b, a = pixels[i*4:i*4+4]
        elif color_type == 2:
            r, g, b = pixels[i*3:i*3+3]; a = 255
        elif color_type == 0:
            r = g = b = pixels[i]; a = 255
        elif color_type == 4:
            r = g = b = pixels[i*2]; a = pixels[i*2+1]
        elif color_type == 3:
            idx = pixels[i]
            r, g, b = palette[idx*3:idx*3+3]
            a = trns[idx] if trns and idx < len(trns) else 255
        rgba[i*4:i*4+4] = bytes((r, g, b, a))
    return width, height, rgba


def write_png(path, w, h, rgba):
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        raw.extend(rgba[y*w*4:(y+1)*w*4])
    comp = zlib.compress(bytes(raw), 9)
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)))
        f.write(chunk(b"IDAT", comp))
        f.write(chunk(b"IEND", b""))


def make_icon(src_w, src_h, src, size, bg, pad_frac, out):
    canvas = bytearray()
    for _ in range(size * size):
        canvas.extend(bytes((*bg, 255)))
    # target box for the logo (aspect preserved)
    box = int(size * (1 - 2 * pad_frac))
    scale = min(box / src_w, box / src_h)
    dw, dh = int(src_w * scale), int(src_h * scale)
    ox, oy = (size - dw) // 2, (size - dh) // 2
    for y in range(dh):
        sy = int(y / scale)
        for x in range(dw):
            sx = int(x / scale)
            si = (sy * src_w + sx) * 4
            r, g, b, a = src[si:si+4]
            if a == 0:
                continue
            di = ((oy + y) * size + (ox + x)) * 4
            if a == 255:
                canvas[di:di+4] = bytes((r, g, b, 255))
            else:  # alpha blend over background
                for c, sv in enumerate((r, g, b)):
                    bv = canvas[di + c]
                    canvas[di + c] = (sv * a + bv * (255 - a)) // 255
    write_png(out, size, size, canvas)
    print("wrote", out)


def autocrop(w, h, src):
    """Trim fully-transparent margins so padding is measured from real content."""
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if src[(y*w+x)*4+3] > 8:
                minx, miny = min(minx, x), min(miny, y)
                maxx, maxy = max(maxx, x), max(maxy, y)
    cw, ch = maxx - minx + 1, maxy - miny + 1
    out = bytearray(cw * ch * 4)
    for y in range(ch):
        s = ((miny+y)*w + minx) * 4
        out[y*cw*4:(y+1)*cw*4] = src[s:s + cw*4]
    return cw, ch, out


w, h, px = read_png("logo-new-cut.png")
print(f"logo {w}x{h}")
w, h, px = autocrop(w, h, px)
print(f"cropped {w}x{h}")
# Standard icons: logo on navy, matching the app background
make_icon(w, h, px, 192, NAVY, 0.12, "icons/icon-192.png")
make_icon(w, h, px, 512, NAVY, 0.12, "icons/icon-512.png")
# Maskable: full-bleed navy with a generous safe zone for Android's crop
make_icon(w, h, px, 512, NAVY, 0.20, "icons/maskable-512.png")
# Apple touch icon (no transparency, navy)
make_icon(w, h, px, 180, NAVY, 0.12, "icons/apple-touch-icon.png")
# Trimmed, transparent logo mark for the in-app header
write_png("icons/logo-mark.png", w, h, px)
print("wrote icons/logo-mark.png", w, "x", h)
