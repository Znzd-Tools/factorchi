'use client';

import { Briefcase, FileText, User } from 'lucide-react';

interface IProfessionStepProps {
	onSelectFreelancer: () => void;
}

export function ProfessionStep({ onSelectFreelancer }: IProfessionStepProps) {
	return (
		<div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans'>
			<div className='max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100'>
				<div className='w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6'>
					<FileText size={40} />
				</div>
				<h1 className='text-3xl font-bold text-slate-800 mb-2'>سلام!</h1>
				<p className='text-slate-500 mb-10 text-lg'>
					برای شروع ساخت فاکتور، لطفاً حوزه فعالیتت رو انتخاب کن.
				</p>

				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					<button
						type='button'
						onClick={onSelectFreelancer}
						className='flex flex-col items-center p-6 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group'
					>
						<Briefcase
							size={32}
							className='text-slate-400 group-hover:text-blue-600 mb-4 transition-colors'
						/>
						<span className='text-lg font-bold text-slate-700 group-hover:text-blue-700'>
							فریلنسر / پروژه‌ای
						</span>
						<span className='text-sm text-slate-500 mt-2'>
							محاسبه ساعتی یا ثابت، ایده‌آل برای برنامه‌نویسان و طراحان
						</span>
					</button>

					<button
						type='button'
						disabled
						className='flex flex-col items-center p-6 border-2 border-slate-100 bg-slate-50 rounded-2xl opacity-60 cursor-not-allowed'
					>
						<User size={32} className='text-slate-300 mb-4' />
						<span className='text-lg font-bold text-slate-400'>فروشگاهی / شرکتی</span>
						<span className='text-sm text-slate-400 mt-2'>
							(به زودی) دارای محصولات و انبارداری
						</span>
					</button>
				</div>
			</div>
		</div>
	);
}
