'use strict';

function readMp4Boxes(buffer, start, end) {
  let offset = start;
  while (offset + 8 <= end) {
    const size32 = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    let headerSize = 8;
    let boxSize = size32;
    if (size32 === 1) {
      if (offset + 16 > end) break;
      const largeSize = buffer.readBigUInt64BE(offset + 8);
      if (largeSize > BigInt(Number.MAX_SAFE_INTEGER)) break;
      boxSize = Number(largeSize);
      headerSize = 16;
    } else if (size32 === 0) boxSize = end - offset;
    if (boxSize < headerSize || offset + boxSize > end) break;
    const dataStart = offset + headerSize;
    const dataEnd = offset + boxSize;
    if (type === 'mvhd') return { dataStart, dataEnd };
    if (type === 'moov') {
      const found = readMp4Boxes(buffer, dataStart, dataEnd);
      if (found) return found;
    }
    offset = dataEnd;
  }
  return null;
}

function mp4Duration(buffer) {
  const header = readMp4Boxes(buffer, 0, buffer.length);
  if (!header) return null;
  const version = buffer[header.dataStart];
  const timescaleOffset = header.dataStart + (version === 1 ? 20 : 12);
  const durationOffset = header.dataStart + (version === 1 ? 24 : 16);
  if (timescaleOffset + 4 > header.dataEnd) return null;
  const timescale = buffer.readUInt32BE(timescaleOffset);
  if (!timescale) return null;
  if (version === 1) {
    if (durationOffset + 8 > header.dataEnd) return null;
    return Number(buffer.readBigUInt64BE(durationOffset)) / timescale;
  }
  if (durationOffset + 4 > header.dataEnd) return null;
  return buffer.readUInt32BE(durationOffset) / timescale;
}

function readVint(buffer, offset, isId = false) {
  if (offset >= buffer.length) return null;
  const first = buffer[offset];
  if (first === 0) return null;
  let mask = 0x80;
  let length = 1;
  while (!(first & mask)) { mask >>= 1; length += 1; }
  if (length > (isId ? 4 : 8) || offset + length > buffer.length) return null;
  let value = isId ? first : first & (mask - 1);
  for (let index = 1; index < length; index += 1) value = value * 256 + buffer[offset + index];
  return { value, length, unknownSize: !isId && value === (2 ** (7 * length)) - 1 };
}

function ebmlElements(buffer, start, end) {
  const elements = [];
  let offset = start;
  while (offset + 2 <= end) {
    const id = readVint(buffer, offset, true);
    if (!id) break;
    const size = readVint(buffer, offset + id.length);
    if (!size) break;
    const dataStart = offset + id.length + size.length;
    const dataEnd = size.unknownSize ? end : dataStart + size.value;
    if (dataEnd > end || dataEnd < dataStart) break;
    elements.push({ id: id.value, dataStart, dataEnd });
    offset = dataEnd;
    if (size.unknownSize) break;
  }
  return elements;
}

function webmDuration(buffer) {
  const segment = ebmlElements(buffer, 0, buffer.length).find((element) => element.id === 0x18538067);
  if (!segment) return null;
  const info = ebmlElements(buffer, segment.dataStart, segment.dataEnd).find((element) => element.id === 0x1549a966);
  if (!info) return null;
  let timecodeScale = 1_000_000;
  let durationTicks = null;
  for (const element of ebmlElements(buffer, info.dataStart, info.dataEnd)) {
    const length = element.dataEnd - element.dataStart;
    if (element.id === 0x2ad7b1 && length > 0 && length <= 8) {
      timecodeScale = 0;
      for (let index = element.dataStart; index < element.dataEnd; index += 1) timecodeScale = timecodeScale * 256 + buffer[index];
    } else if (element.id === 0x4489 && (length === 4 || length === 8)) {
      durationTicks = length === 4 ? buffer.readFloatBE(element.dataStart) : buffer.readDoubleBE(element.dataStart);
    }
  }
  if (!durationTicks || !timecodeScale) return null;
  return durationTicks * timecodeScale / 1_000_000_000;
}

function readVideoDuration(buffer, mimeType) {
  const duration = mimeType === 'video/mp4' ? mp4Duration(buffer) : webmDuration(buffer);
  return Number.isFinite(duration) && duration > 0 ? duration : null;
}

module.exports = { readVideoDuration };
