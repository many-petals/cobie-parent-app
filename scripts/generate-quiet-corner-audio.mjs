import fs from 'node:fs';
import path from 'node:path';

const sampleRate = 22_050;
const durationSeconds = 24;
const totalSamples = sampleRate * durationSeconds;
const outputDir = path.resolve('public', 'sounds', 'quiet-corner');

class RNG {
  constructor(seed) {
    this.seed = seed >>> 0;
  }

  next() {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }

  between(min, max) {
    return min + (max - min) * this.next();
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function addSine(buffer, startSeconds, noteSeconds, frequencyStart, frequencyEnd, amplitude, options = {}) {
  const start = Math.floor(startSeconds * sampleRate);
  const length = Math.floor(noteSeconds * sampleRate);
  const attack = options.attackSeconds ?? 0.02;
  const release = options.releaseSeconds ?? Math.min(noteSeconds * 0.5, 0.25);
  const harmonic = options.harmonic ?? 0.35;
  const vibratoDepth = options.vibratoDepth ?? 0;
  const vibratoRate = options.vibratoRate ?? 0;

  let phase = 0;
  let overtonePhase = 0;

  for (let index = 0; index < length && start + index < buffer.length; index += 1) {
    const progress = index / Math.max(1, length - 1);
    const seconds = index / sampleRate;
    const attackEnv = clamp(seconds / Math.max(attack, 0.0001), 0, 1);
    const releaseStart = Math.max(0, noteSeconds - release);
    const releaseEnv = seconds > releaseStart
      ? clamp(1 - (seconds - releaseStart) / Math.max(release, 0.0001), 0, 1)
      : 1;
    const envelope = attackEnv * releaseEnv;
    const vibrato = vibratoDepth > 0
      ? Math.sin(2 * Math.PI * vibratoRate * seconds) * vibratoDepth
      : 0;
    const frequency = lerp(frequencyStart, frequencyEnd, progress) + vibrato;
    phase += (2 * Math.PI * frequency) / sampleRate;
    overtonePhase += (2 * Math.PI * frequency * 2) / sampleRate;
    buffer[start + index] += (
      Math.sin(phase) * amplitude +
      Math.sin(overtonePhase) * amplitude * harmonic
    ) * envelope;
  }
}

function addNoise(buffer, amplitude, smoothing, modulation = () => 1, seed = 1) {
  const rng = new RNG(seed);
  let previous = 0;
  for (let index = 0; index < buffer.length; index += 1) {
    const white = rng.next() * 2 - 1;
    previous = previous * smoothing + white * (1 - smoothing);
    buffer[index] += previous * amplitude * modulation(index / sampleRate, index);
  }
}

function addDroplets(buffer, seed) {
  const rng = new RNG(seed);
  for (let drop = 0; drop < 140; drop += 1) {
    const start = rng.between(0.2, durationSeconds - 0.8);
    const length = rng.between(0.035, 0.08);
    const startFreq = rng.between(1300, 2200);
    const endFreq = startFreq * rng.between(0.72, 0.9);
    addSine(buffer, start, length, startFreq, endFreq, rng.between(0.025, 0.05), {
      attackSeconds: 0.002,
      releaseSeconds: length * 0.9,
      harmonic: 0.2,
    });
  }
}

function addCricketCluster(buffer, clusterStart, seed) {
  const rng = new RNG(seed);
  const chirpCount = 6 + Math.floor(rng.between(0, 4));
  for (let chirp = 0; chirp < chirpCount; chirp += 1) {
    const start = clusterStart + chirp * rng.between(0.18, 0.26);
    const duration = rng.between(0.035, 0.06);
    const frequency = rng.between(2350, 2950);
    addSine(buffer, start, duration, frequency, frequency * rng.between(0.98, 1.04), rng.between(0.012, 0.02), {
      attackSeconds: 0.003,
      releaseSeconds: duration * 0.8,
      harmonic: 0.12,
    });
  }
}

function addBellNote(buffer, startSeconds, duration, frequency, amplitude) {
  addSine(buffer, startSeconds, duration, frequency, frequency, amplitude, {
    attackSeconds: 0.005,
    releaseSeconds: duration * 0.85,
    harmonic: 0.45,
    vibratoDepth: 2,
    vibratoRate: 4,
  });
  addSine(buffer, startSeconds, duration, frequency * 2, frequency * 2, amplitude * 0.25, {
    attackSeconds: 0.005,
    releaseSeconds: duration * 0.75,
    harmonic: 0.1,
  });
}

function addPadNote(buffer, startSeconds, duration, frequency, amplitude) {
  addSine(buffer, startSeconds, duration, frequency, frequency, amplitude, {
    attackSeconds: 0.6,
    releaseSeconds: 1.2,
    harmonic: 0.28,
    vibratoDepth: 1.5,
    vibratoRate: 2.2,
  });
}

function fadeEdges(buffer) {
  const fadeSamples = Math.floor(sampleRate * 0.6);
  for (let index = 0; index < fadeSamples; index += 1) {
    const envelope = Math.sin((index / fadeSamples) * (Math.PI / 2));
    buffer[index] *= envelope;
    buffer[buffer.length - 1 - index] *= envelope;
  }
}

function normalize(buffer, peak = 0.85) {
  let max = 0;
  for (const value of buffer) {
    const absolute = Math.abs(value);
    if (absolute > max) {
      max = absolute;
    }
  }

  if (max === 0) {
    return buffer;
  }

  const scale = peak / max;
  for (let index = 0; index < buffer.length; index += 1) {
    buffer[index] *= scale;
  }
  return buffer;
}

function writeWavFile(fileName, buffer) {
  normalize(buffer);
  fadeEdges(buffer);

  const pcm = Buffer.alloc(buffer.length * 2);
  for (let index = 0; index < buffer.length; index += 1) {
    const sample = Math.round(clamp(buffer[index], -1, 1) * 32767);
    pcm.writeInt16LE(sample, index * 2);
  }

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);

  fs.writeFileSync(path.join(outputDir, fileName), Buffer.concat([header, pcm]));
}

function createRainGentle() {
  const buffer = new Float32Array(totalSamples);
  addNoise(buffer, 0.17, 0.985, (seconds) => 0.85 + Math.sin(seconds * 0.55) * 0.08, 11);
  addNoise(buffer, 0.05, 0.82, () => 1, 12);
  addDroplets(buffer, 13);
  return buffer;
}

function createOceanWaves() {
  const buffer = new Float32Array(totalSamples);
  addNoise(
    buffer,
    0.22,
    0.992,
    (seconds) => {
      const swell = 0.35 + 0.65 * Math.pow((Math.sin((2 * Math.PI * seconds) / 6.8) + 1) / 2, 1.5);
      return 0.45 + swell * 0.65;
    },
    21,
  );
  addSine(buffer, 0, durationSeconds, 82, 78, 0.035, {
    attackSeconds: 0.8,
    releaseSeconds: 0.8,
    harmonic: 0.08,
  });
  return buffer;
}

function createForestBirds() {
  const buffer = new Float32Array(totalSamples);
  addNoise(buffer, 0.11, 0.988, (seconds) => 0.8 + Math.sin(seconds * 0.3) * 0.12, 31);
  const chirps = [
    [2.2, 0.18, 1700, 2050],
    [5.6, 0.22, 1500, 1900],
    [8.7, 0.16, 1800, 2200],
    [12.4, 0.24, 1600, 1850],
    [15.8, 0.2, 1750, 2150],
    [19.6, 0.17, 1550, 2000],
  ];
  for (const [start, duration, freqStart, freqEnd] of chirps) {
    addSine(buffer, start, duration, freqStart, freqEnd, 0.038, {
      attackSeconds: 0.01,
      releaseSeconds: duration * 0.8,
      harmonic: 0.16,
      vibratoDepth: 4,
      vibratoRate: 7,
    });
  }
  return buffer;
}

function createStreamWater() {
  const buffer = new Float32Array(totalSamples);
  addNoise(buffer, 0.16, 0.93, (seconds) => 0.8 + Math.sin(seconds * 0.9) * 0.05, 41);
  addNoise(buffer, 0.06, 0.55, () => 1, 42);
  const rng = new RNG(43);
  for (let bubble = 0; bubble < 90; bubble += 1) {
    const start = rng.between(0, durationSeconds - 0.15);
    const duration = rng.between(0.02, 0.06);
    const freq = rng.between(500, 900);
    addSine(buffer, start, duration, freq, freq * 1.2, rng.between(0.01, 0.025), {
      attackSeconds: 0.003,
      releaseSeconds: duration * 0.75,
      harmonic: 0.15,
    });
  }
  return buffer;
}

function createWindTrees() {
  const buffer = new Float32Array(totalSamples);
  addNoise(
    buffer,
    0.16,
    0.991,
    (seconds) => 0.6 + 0.4 * ((Math.sin((2 * Math.PI * seconds) / 8.5) + 1) / 2),
    51,
  );
  addNoise(buffer, 0.035, 0.6, (seconds) => 0.4 + 0.6 * ((Math.sin((2 * Math.PI * seconds) / 4.2) + 1) / 2), 52);
  return buffer;
}

function createNightCrickets() {
  const buffer = new Float32Array(totalSamples);
  addNoise(buffer, 0.035, 0.992, () => 1, 61);
  const clusterStarts = [1.4, 4.8, 8.2, 11.9, 15.2, 18.7, 21.3];
  clusterStarts.forEach((start, index) => addCricketCluster(buffer, start, 70 + index));
  return buffer;
}

function createSoftLullaby() {
  const buffer = new Float32Array(totalSamples);
  const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 698.46, 659.25];
  for (let loop = 0; loop < 3; loop += 1) {
    const offset = loop * 8;
    notes.forEach((frequency, index) => {
      addBellNote(buffer, offset + index * 0.95, 1.8, frequency, 0.06);
    });
  }
  addPadNote(buffer, 0, durationSeconds, 261.63, 0.018);
  addPadNote(buffer, 8, 8, 293.66, 0.016);
  addPadNote(buffer, 16, 8, 246.94, 0.016);
  return buffer;
}

function createPeacefulPiano() {
  const buffer = new Float32Array(totalSamples);
  const chords = [
    [261.63, 329.63, 392.0],
    [293.66, 369.99, 440.0],
    [246.94, 329.63, 392.0],
  ];
  for (let section = 0; section < 3; section += 1) {
    const base = section * 8;
    const chord = chords[section];
    for (let beat = 0; beat < 4; beat += 1) {
      addSine(buffer, base + beat * 1.5, 2.8, chord[0], chord[0], 0.035, {
        attackSeconds: 0.01,
        releaseSeconds: 1.4,
        harmonic: 0.22,
      });
      addSine(buffer, base + beat * 1.5 + 0.25, 2.4, chord[1], chord[1], 0.026, {
        attackSeconds: 0.01,
        releaseSeconds: 1.2,
        harmonic: 0.18,
      });
      addSine(buffer, base + beat * 1.5 + 0.5, 2.1, chord[2], chord[2], 0.02, {
        attackSeconds: 0.01,
        releaseSeconds: 1.1,
        harmonic: 0.16,
      });
    }
  }
  return buffer;
}

function createDreamyMelody() {
  const buffer = new Float32Array(totalSamples);
  const padNotes = [392.0, 440.0, 349.23];
  padNotes.forEach((frequency, index) => {
    addPadNote(buffer, index * 8, 8, frequency, 0.04);
    addPadNote(buffer, index * 8, 8, frequency * 1.5, 0.02);
  });
  const bells = [
    [2, 783.99],
    [5.5, 659.25],
    [9.5, 880.0],
    [13.5, 698.46],
    [18, 783.99],
    [21, 587.33],
  ];
  bells.forEach(([start, frequency]) => addBellNote(buffer, start, 2.6, frequency, 0.04));
  return buffer;
}

function createSoftWhiteNoise() {
  const buffer = new Float32Array(totalSamples);
  addNoise(buffer, 0.12, 0.45, () => 1, 91);
  return buffer;
}

function createPinkNoise() {
  const buffer = new Float32Array(totalSamples);
  addNoise(buffer, 0.13, 0.92, () => 1, 101);
  return buffer;
}

function createGentleFan() {
  const buffer = new Float32Array(totalSamples);
  addNoise(buffer, 0.08, 0.96, () => 1, 111);
  addSine(buffer, 0, durationSeconds, 115, 112, 0.04, {
    attackSeconds: 0.4,
    releaseSeconds: 0.4,
    harmonic: 0.12,
  });
  addSine(buffer, 0, durationSeconds, 230, 224, 0.012, {
    attackSeconds: 0.4,
    releaseSeconds: 0.4,
    harmonic: 0.08,
  });
  return buffer;
}

ensureDir(outputDir);

const soundBuilders = [
  ['rain-gentle.wav', createRainGentle],
  ['ocean-waves.wav', createOceanWaves],
  ['forest-birds.wav', createForestBirds],
  ['stream-water.wav', createStreamWater],
  ['wind-trees.wav', createWindTrees],
  ['night-crickets.wav', createNightCrickets],
  ['music-lullaby.wav', createSoftLullaby],
  ['music-peaceful.wav', createPeacefulPiano],
  ['music-dreamy.wav', createDreamyMelody],
  ['whitenoise-soft.wav', createSoftWhiteNoise],
  ['whitenoise-pink.wav', createPinkNoise],
  ['whitenoise-fan.wav', createGentleFan],
];

soundBuilders.forEach(([fileName, createBuffer]) => {
  writeWavFile(fileName, createBuffer());
  console.log(`Generated ${fileName}`);
});
