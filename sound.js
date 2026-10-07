/**
 * Web Audio Synthesizer for Birthday Music & Celebration Sound Effects
 * Completely self-contained, no external audio files required!
 */

class BirthdayAudioSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timeoutIds = [];

    // "Happy Birthday to You" notes & durations in C Major
    this.melody = [
      { note: 'G4', dur: 0.75 },
      { note: 'G4', dur: 0.25 },
      { note: 'A4', dur: 1.0 },
      { note: 'G4', dur: 1.0 },
      { note: 'C5', dur: 1.0 },
      { note: 'B4', dur: 2.0 },

      { note: 'G4', dur: 0.75 },
      { note: 'G4', dur: 0.25 },
      { note: 'A4', dur: 1.0 },
      { note: 'G4', dur: 1.0 },
      { note: 'D5', dur: 1.0 },
      { note: 'C5', dur: 2.0 },

      { note: 'G4', dur: 0.75 },
      { note: 'G4', dur: 0.25 },
      { note: 'G5', dur: 1.0 },
      { note: 'E5', dur: 1.0 },
      { note: 'C5', dur: 1.0 },
      { note: 'B4', dur: 1.0 },
      { note: 'A4', dur: 1.5 },

      { note: 'F5', dur: 0.75 },
      { note: 'F5', dur: 0.25 },
      { note: 'E5', dur: 1.0 },
      { note: 'C5', dur: 1.0 },
      { note: 'D5', dur: 1.0 },
      { note: 'C5', dur: 2.5 }
    ];

    this.frequencies = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
      'C6': 1046.50
    };
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, duration, type = 'sine', gainVal = 0.2) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Warm bell / chime envelope
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(gainVal, this.ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration * 0.95);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  toggleMusic(onToggleCallback) {
    this.initContext();
    if (this.isPlaying) {
      this.stopMusic();
      if (onToggleCallback) onToggleCallback(false);
    } else {
      this.isPlaying = true;
      this.playMelodyLoop();
      if (onToggleCallback) onToggleCallback(true);
    }
  }

  playMelodyLoop() {
    if (!this.isPlaying) return;
    let accumulatedTime = 0;
    const tempo = 0.55; // seconds per beat

    this.melody.forEach(item => {
      const freq = this.frequencies[item.note];
      const duration = item.dur * tempo;

      const tId = setTimeout(() => {
        if (!this.isPlaying) return;
        // Layered chime (fundamental + harmonic)
        this.playTone(freq, duration, 'triangle', 0.22);
        this.playTone(freq * 2, duration * 0.7, 'sine', 0.08);
      }, accumulatedTime * 1000);

      this.timeoutIds.push(tId);
      accumulatedTime += duration;
    });

    // Schedule next loop after small pause
    const loopId = setTimeout(() => {
      if (this.isPlaying) {
        this.playMelodyLoop();
      }
    }, (accumulatedTime + 1.2) * 1000);

    this.timeoutIds.push(loopId);
  }

  stopMusic() {
    this.isPlaying = false;
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
  }

  playBlowCandleSound() {
    this.initContext();
    if (!this.ctx) return;

    // Synthesize gentle wind puff using white noise buffer
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.5);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.55);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    whiteNoise.start();
  }

  playCheerChime() {
    this.initContext();
    if (!this.ctx) return;

    // Uplifting celebratory harp arpeggio
    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 1.2, 'sine', 0.2);
      }, idx * 90);
    });
  }
}

window.BirthdayAudioSynth = BirthdayAudioSynth;
