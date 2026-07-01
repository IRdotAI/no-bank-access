#!/usr/bin/env python3
"""Cut the new logo out of its dark rectangle background into a transparent
PNG. Uses a flood-fill from the edges so the badge's (dark) interior is kept
while the surrounding background is removed and the glow is preserved.
Standard library only."""
import struct, zlib
from collections import deque

SRC = "logo-new.PNG"
OUT = "logo-new-cut.png"
# crop square around the badge+glow (excludes the little sparkle on the right)
CX, CY, HALF = 703, 382, 330
BG_LUM = 42          # pixels dimmer than this, reachable from the edge, are background

def read_png(path):
    d = open(path, "rb").read(); pos = 8; W = H = ct = None; idat = b""
    while pos < len(d):
        ln = struct.unpack(">I", d[pos:pos+4])[0]; t = d[pos+4:pos+8]; ch = d[pos+8:pos+8+ln]
        if t == b"IHDR": W, H, _, ct = struct.unpack(">IIBB", ch[:10])
        elif t == b"IDAT": idat += ch
        elif t == b"IEND": break
        pos += 12 + ln
    raw = zlib.decompress(idat); cn = 3 if ct == 2 else 4; stride = W * cn
    out = bytearray(); prev = bytearray(stride); p = 0
    for _ in range(H):
        f = raw[p]; p += 1; line = bytearray(raw[p:p+stride]); p += stride
        for i in range(stride):
            a = line[i-cn] if i >= cn else 0; b = prev[i]; c = prev[i-cn] if i >= cn else 0; x = line[i]
            if f == 1: x += a
            elif f == 2: x += b
            elif f == 3: x += (a + b) // 2
            elif f == 4:
                pp = a + b - c; pa = abs(pp-a); pb = abs(pp-b); pc = abs(pp-c)
                x += a if pa <= pb and pa <= pc else (b if pb <= pc else c)
            line[i] = x & 255
        out.extend(line); prev = line
    return W, H, cn, out

def write_png(path, w, h, rgba):
    raw = bytearray()
    for y in range(h):
        raw.append(0); raw.extend(rgba[y*w*4:(y+1)*w*4])
    comp = zlib.compress(bytes(raw), 9)
    def chunk(t, d): return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)))
        f.write(chunk(b"IDAT", comp)); f.write(chunk(b"IEND", b""))

W, H, cn, px = read_png(SRC)
x0, y0 = CX - HALF, CY - HALF
S = HALF * 2
# crop RGB + luminance
rgb = bytearray(S * S * 3)
lum = [0] * (S * S)
for y in range(S):
    for x in range(S):
        si = ((y0 + y) * W + (x0 + x)) * cn
        r, g, b = px[si], px[si+1], px[si+2]
        di = (y * S + x) * 3
        rgb[di], rgb[di+1], rgb[di+2] = r, g, b
        lum[y * S + x] = int(0.299*r + 0.587*g + 0.114*b)

# flood fill background from the border
bg = bytearray(S * S)          # 1 = background
q = deque()
for x in range(S):
    for y in (0, S - 1):
        i = y * S + x
        if lum[i] < BG_LUM and not bg[i]: bg[i] = 1; q.append((x, y))
for y in range(S):
    for x in (0, S - 1):
        i = y * S + x
        if lum[i] < BG_LUM and not bg[i]: bg[i] = 1; q.append((x, y))
while q:
    x, y = q.popleft()
    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < S and 0 <= ny < S:
            j = ny * S + nx
            if not bg[j] and lum[j] < BG_LUM:
                bg[j] = 1; q.append((nx, ny))

# alpha = 0 where background, else 255; then a 3x3 blur to feather the edge
alpha = [0 if bg[i] else 255 for i in range(S * S)]
feather = [0] * (S * S)
for y in range(S):
    for x in range(S):
        s = c = 0
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                nx, ny = x + dx, y + dy
                if 0 <= nx < S and 0 <= ny < S:
                    s += alpha[ny * S + nx]; c += 1
        feather[y * S + x] = s // c

rgba = bytearray(S * S * 4)
for i in range(S * S):
    rgba[i*4]   = rgb[i*3]
    rgba[i*4+1] = rgb[i*3+1]
    rgba[i*4+2] = rgb[i*3+2]
    rgba[i*4+3] = feather[i]
write_png(OUT, S, S, rgba)
print("wrote", OUT, S, "x", S)
