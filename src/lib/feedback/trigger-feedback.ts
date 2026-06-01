import { getFeedbackPreferences } from '@/lib/feedback/preferences';
import { playFeedbackSound } from '@/lib/feedback/sounds';
import { type HapticPattern, triggerHapticOnly } from '@/lib/haptics';

const PALETTE_LABELS: Record<HapticPattern, string> = {
	light: 'لمس سبک',
	medium: 'لمس معمولی',
	heavy: 'لمس قوی',
	selection: 'انتخاب',
	success: 'موفقیت',
	warning: 'هشدار',
	error: 'خطا',
	celebration: 'جشن',
};

export function getFeedbackPaletteLabels(): typeof PALETTE_LABELS {
	return PALETTE_LABELS;
}

export function triggerFeedback(pattern: HapticPattern): void {
	const { hapticsEnabled, soundsEnabled } = getFeedbackPreferences();

	if (hapticsEnabled) {
		triggerHapticOnly(pattern);
	}

	if (soundsEnabled) {
		void playFeedbackSound(pattern);
	}
}
