import type { HapticPattern } from '@/lib/haptics';

type ToneStep = {
	frequency: number;
	durationMs: number;
	type?: OscillatorType;
	gain?: number;
};

const SOUND_STEPS: Record<HapticPattern, ToneStep[]> = {
	light: [{ frequency: 880, durationMs: 28, gain: 0.045 }],
	medium: [{ frequency: 660, durationMs: 36, gain: 0.055 }],
	heavy: [{ frequency: 220, durationMs: 52, gain: 0.07, type: 'triangle' }],
	selection: [{ frequency: 1040, durationMs: 18, gain: 0.035 }],
	success: [
		{ frequency: 523, durationMs: 70, gain: 0.05 },
		{ frequency: 784, durationMs: 110, gain: 0.055 },
	],
	warning: [
		{ frequency: 440, durationMs: 55, gain: 0.05 },
		{ frequency: 349, durationMs: 80, gain: 0.05 },
	],
	error: [
		{ frequency: 180, durationMs: 90, gain: 0.065, type: 'sawtooth' },
		{ frequency: 140, durationMs: 110, gain: 0.05, type: 'sawtooth' },
	],
	celebration: [
		{ frequency: 523, durationMs: 60, gain: 0.05 },
		{ frequency: 659, durationMs: 60, gain: 0.05 },
		{ frequency: 784, durationMs: 140, gain: 0.06 },
	],
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
	if (typeof window === 'undefined') {
		return null;
	}

	if (!audioContext) {
		const Ctx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

		if (!Ctx) {
			return null;
		}

		audioContext = new Ctx();
	}

	return audioContext;
}

function playToneStep(context: AudioContext, step: ToneStep, startAt: number): number {
	const oscillator = context.createOscillator();
	const gainNode = context.createGain();
	const durationSec = step.durationMs / 1000;
	const peakGain = step.gain ?? 0.05;

	oscillator.type = step.type ?? 'sine';
	oscillator.frequency.setValueAtTime(step.frequency, startAt);
	gainNode.gain.setValueAtTime(peakGain, startAt);
	gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + durationSec);
	oscillator.connect(gainNode);
	gainNode.connect(context.destination);
	oscillator.start(startAt);
	oscillator.stop(startAt + durationSec);

	return durationSec;
}

export function canUseFeedbackSounds(): boolean {
	return getAudioContext() !== null;
}

export async function playFeedbackSound(pattern: HapticPattern): Promise<void> {
	const context = getAudioContext();

	if (!context) {
		return;
	}

	if (context.state === 'suspended') {
		try {
			await context.resume();
		} catch {
			return;
		}
	}

	const steps = SOUND_STEPS[pattern];
	let cursor = context.currentTime + 0.01;

	for (const step of steps) {
		const duration = playToneStep(context, step, cursor);
		cursor += duration * 0.85;
	}
}
