import { AlertCircle, ChevronLeft } from 'lucide-react';

import { HapticLink } from '@/components/ui/HapticLink';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Surface } from '@/components/ui/Surface';
import type { IAttentionItem } from '@/features/dashboard/utils/attention-items';

interface INeedsAttentionProps {
	items: IAttentionItem[];
}

function toneForKind(kind: IAttentionItem['kind']) {
	if (kind === 'overdue_invoice') {
		return 'critical' as const;
	}

	if (kind === 'pending_invoice') {
		return 'warning' as const;
	}

	return 'info' as const;
}

function labelForKind(kind: IAttentionItem['kind']) {
	if (kind === 'overdue_invoice') {
		return 'سررسید';
	}

	if (kind === 'pending_invoice') {
		return 'در انتظار';
	}

	return 'پروژه';
}

export function NeedsAttention({ items }: INeedsAttentionProps) {
	if (items.length === 0) {
		return null;
	}

	return (
		<Surface title='نیازمند توجه' description='اقدام‌های مهم قبل از بقیه کارها'>
			<ul className='space-y-2'>
				{items.map((item) => (
					<li key={item.id}>
						<HapticLink
							href={item.href}
							haptic='light'
							className='flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-3 transition-colors active:bg-muted'
						>
							<div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive'>
								<AlertCircle size={18} aria-hidden />
							</div>
							<div className='min-w-0 flex-1'>
								<div className='flex flex-wrap items-center gap-2'>
									<p className='truncate text-sm font-bold text-foreground'>{item.title}</p>
									<StatusBadge label={labelForKind(item.kind)} tone={toneForKind(item.kind)} />
								</div>
								<p className='mt-0.5 truncate text-xs text-muted-foreground'>{item.subtitle}</p>
							</div>
							<ChevronLeft size={16} className='shrink-0 text-muted-foreground' aria-hidden />
						</HapticLink>
					</li>
				))}
			</ul>
		</Surface>
	);
}
