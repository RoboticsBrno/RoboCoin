import Button from '@/components/ui/Button';

type BasicAttributes = {
	children?: React.ReactNode;
	className?: string;
	[key: string]: any;
};

export function BaseForm({ children, className = '', ...props }: BasicAttributes) {
	return (
		<form
			className={`max-w-lg mx-auto bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl px-10 py-12 border border-white/20 ${className}`}
			{...props}
		>
			<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
			<div className="relative">
				{children}
			</div>
		</form>
	);
}

export function FormTitle({ children, className = '', ...props }: BasicAttributes) {
	return (
		<h2 className={`text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${className}`} {...props}>
			{children}
		</h2>
	);
}

export function FormGroup({ children, className = '', ...props }: BasicAttributes) {
	return (
		<div className={`mb-6 ${className}`} {...props}>
			{children}
		</div>
	);
}

export function FormLabel({ children, className = '', ...props }: BasicAttributes) {
	return (
		<label className={`block text-gray-700 font-semibold mb-2 text-lg ${className}`} {...props}>
			{children}
		</label>
	);
}

export function FormInput({ className = '', ...props }: BasicAttributes) {
	return (
		<input
			className={`w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-lg bg-white/80 backdrop-blur-sm ${className}`}
			{...props}
		/>
	);
}

export function FormSubmit({ children, className = '', ...props }: BasicAttributes) {
	return (
		<Button variant="success" size="md" type="submit" className={`w-full text-xl py-4 ${className}`} {...props}>
			{children}
		</ Button>
	);
}
