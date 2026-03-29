const OCTAVE_SIZE = 12;
// Частотный эталон для расчёта остальных нот. Менять не нужно, если не хотим сдвинуть весь строй.
const REFERENCE_FREQUENCY = 440;
// Основание экспоненты в формуле равномерно темперированного строя. Менять не нужно.
const EQUAL_TEMPERAMENT_RATIO_BASE = 2;
// MIDI-номер эталонной ноты для пересчёта частот. Менять только вместе с REFERENCE_FREQUENCY.
const REFERENCE_MIDI_NOTE_NUMBER = 69;
// Сдвиг между номером октавы в приложении и MIDI-октавой. Это техническая константа формулы.
const MIDI_OCTAVE_OFFSET = 1;

// Длительность ноты по умолчанию. Уменьшишь — звук станет короче и суше, увеличишь — длиннее и начнёт сильнее наслаиваться.
const DEFAULT_PLAY_DURATION_SECONDS = 2;
// Пиковая громкость по умолчанию. Уменьшишь — звук станет тише, увеличишь — громче и плотнее.
const DEFAULT_GAIN_PEAK = 0.5;
// Тип волны по умолчанию. `sine` мягче, `triangle` звонче, `square` и `sawtooth` резче.
const DEFAULT_WAVE_TYPE: OscillatorType = 'triangle';
// Длительность атаки по умолчанию. Уменьшишь — начало будет резче, увеличишь — мягче.
const DEFAULT_ATTACK_DURATION_SECONDS = 0.02;
// Момент начала затухания по умолчанию. Уменьшишь — нота начнёт затухать раньше, увеличишь — дольше задержится на пике.
const DEFAULT_RELEASE_START_SECONDS = 0;

// Базовая октава, ниже которой начинаем добавлять "звонкость". Уменьшишь — компенсация затронет меньше низких нот, увеличишь — больше.
const DEFAULT_BRIGHTNESS_REFERENCE_OCTAVE = 4;
// Прибавка звонкости на каждую октаву ниже базовой. Уменьшишь — компенсация будет слабее, увеличишь — бас станет ярче.
const DEFAULT_LOW_OCTAVE_BRIGHTNESS_STEP = 0.2;
// Верхний предел звонкости для низких нот. Уменьшишь — низ останется мягче, увеличишь — может стать слишком резким.
const DEFAULT_MAX_LOW_OCTAVE_BRIGHTNESS_GAIN = 0.4;
// Множитель яркого дополнительного голоса. 2 = октава вверх; увеличишь — оттенок станет более искусственным.
const DEFAULT_BRIGHTNESS_OVERTONE_MULTIPLIER = 2;
// Тип волны дополнительного яркого голоса. Более "острая" волна сильнее подчёркивает низкие октавы.
const DEFAULT_BRIGHTNESS_OVERTONE_WAVE_TYPE: OscillatorType = 'triangle';

export type audioPlayParams = {
  pitchClass: number
  octave: number
};

export type audioServiceOptions = {
  playDurationSeconds?: number
  gainPeak?: number
  waveType?: OscillatorType
  attackDurationSeconds?: number
  releaseStartSeconds?: number
  brightnessReferenceOctave?: number
  lowOctaveBrightnessStep?: number
  maxLowOctaveBrightnessGain?: number
  brightnessOvertoneMultiplier?: number
  brightnessOvertoneWaveType?: OscillatorType
};

type audioServiceConfig = Required<audioServiceOptions>;

export class AudioService {
  private audioContext: AudioContext | null = null;
  private readonly config: audioServiceConfig;
  private resumePromise: Promise<void> | null = null;

  constructor(options: audioServiceOptions = {}) {
    this.config = {
      playDurationSeconds: options.playDurationSeconds ?? DEFAULT_PLAY_DURATION_SECONDS,
      gainPeak: options.gainPeak ?? DEFAULT_GAIN_PEAK,
      waveType: options.waveType ?? DEFAULT_WAVE_TYPE,
      attackDurationSeconds: options.attackDurationSeconds ?? DEFAULT_ATTACK_DURATION_SECONDS,
      releaseStartSeconds: options.releaseStartSeconds ?? DEFAULT_RELEASE_START_SECONDS,
      brightnessReferenceOctave: options.brightnessReferenceOctave ?? DEFAULT_BRIGHTNESS_REFERENCE_OCTAVE,
      lowOctaveBrightnessStep: options.lowOctaveBrightnessStep ?? DEFAULT_LOW_OCTAVE_BRIGHTNESS_STEP,
      maxLowOctaveBrightnessGain: options.maxLowOctaveBrightnessGain ?? DEFAULT_MAX_LOW_OCTAVE_BRIGHTNESS_GAIN,
      brightnessOvertoneMultiplier: options.brightnessOvertoneMultiplier ?? DEFAULT_BRIGHTNESS_OVERTONE_MULTIPLIER,
      brightnessOvertoneWaveType: options.brightnessOvertoneWaveType ?? DEFAULT_BRIGHTNESS_OVERTONE_WAVE_TYPE,
    };
  }

  play({ pitchClass, octave }: audioPlayParams): void {
    void this.playInternal({ pitchClass, octave });
  }

  private getAudioContext(): AudioContext | null {
    const standardAudioContext = window.AudioContext;
    const webkitAudioContext = (<{ webkitAudioContext?: typeof AudioContext }><unknown>window).webkitAudioContext;
    const AudioContextConstructor = standardAudioContext || webkitAudioContext;

    if (!AudioContextConstructor) {
      return null;
    }

    if (!this.audioContext) {
      this.audioContext = new AudioContextConstructor();
    }

    return this.audioContext;
  }

  private async ensureAudioContextStarted(): Promise<AudioContext | null> {
    const audioContext = this.getAudioContext();

    if (!audioContext) {
      return null;
    }

    if (audioContext.state !== 'suspended') {
      return audioContext;
    }

    if (!this.resumePromise) {
      this.resumePromise = audioContext.resume().finally(() => {
        this.resumePromise = null;
      });
    }

    await this.resumePromise;
    return audioContext;
  }

  private async playInternal({ pitchClass, octave }: audioPlayParams): Promise<void> {
    const audioContext = await this.ensureAudioContextStarted();

    if (!audioContext) {
      return;
    }

    const normalizedPitchClass = this.normalizePitchClass(pitchClass);
    const frequency = this.getFrequency(normalizedPitchClass, octave);
    const brightnessGain = this.getLowOctaveBrightnessGain(octave);
    const startTime = audioContext.currentTime;
    const attackEnd = startTime + this.config.attackDurationSeconds;
    const releaseStart = startTime + this.config.releaseStartSeconds;
    const stopTime = startTime + this.config.playDurationSeconds;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const brightnessOscillator = audioContext.createOscillator();
    const brightnessGainNode = audioContext.createGain();

    oscillator.type = this.config.waveType;
    oscillator.frequency.value = frequency;
    brightnessOscillator.type = this.config.brightnessOvertoneWaveType;
    brightnessOscillator.frequency.value = frequency * this.config.brightnessOvertoneMultiplier;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(this.config.gainPeak, attackEnd);
    gainNode.gain.setValueAtTime(this.config.gainPeak, releaseStart);
    gainNode.gain.linearRampToValueAtTime(0, stopTime);

    brightnessGainNode.gain.setValueAtTime(0, startTime);
    brightnessGainNode.gain.linearRampToValueAtTime(brightnessGain, attackEnd);
    brightnessGainNode.gain.setValueAtTime(brightnessGain, releaseStart);
    brightnessGainNode.gain.linearRampToValueAtTime(0, stopTime);

    oscillator.connect(gainNode);
    brightnessOscillator.connect(brightnessGainNode);
    gainNode.connect(audioContext.destination);
    brightnessGainNode.connect(audioContext.destination);

    oscillator.start(startTime);
    brightnessOscillator.start(startTime);
    oscillator.stop(stopTime);
    brightnessOscillator.stop(stopTime);
  }

  private normalizePitchClass(pitchClass: number): number {
    return (pitchClass + OCTAVE_SIZE) % OCTAVE_SIZE;
  }

  private getFrequency(pitchClass: number, octave: number): number {
    const midiNoteNumber = (octave + MIDI_OCTAVE_OFFSET) * OCTAVE_SIZE + pitchClass;
    const semitoneOffset = midiNoteNumber - REFERENCE_MIDI_NOTE_NUMBER;
    return REFERENCE_FREQUENCY * (EQUAL_TEMPERAMENT_RATIO_BASE ** (semitoneOffset / OCTAVE_SIZE));
  }

  private getLowOctaveBrightnessGain(octave: number): number {
    const octaveDistance = Math.max(0, this.config.brightnessReferenceOctave - octave);
    const brightnessGain = octaveDistance * this.config.lowOctaveBrightnessStep;
    return Math.min(this.config.maxLowOctaveBrightnessGain, brightnessGain);
  }
}
