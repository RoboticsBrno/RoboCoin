import { AlertTriangle } from 'lucide-react';

export function Alert({ variant = 'danger', children, className = '', ...props }: { variant: 'danger' | 'info' | 'success', children?: React.ReactNode, className?: string }) {
	const variants = {
		danger: 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-800',
		info: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 text-blue-800',
		success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-800'
	};
	return (
		<div className={`rounded-2xl p-6 shadow-lg ${variants[variant]} ${className}`} {...props}>
			<div className="flex items-center gap-3">
				<AlertTriangle className="text-2xl flex-shrink-0" />
				<div className="text-lg font-semibold">{children}</div>
			</div>
		</div>
	);
}
