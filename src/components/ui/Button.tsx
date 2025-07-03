"use client";
import { useRef } from "react";

export default function Button({ variant = 'primary', size = 'md', className = '', children, onClick, ...props }: { variant: 'primary' | 'success' | 'secondary' | 'info' | 'danger'; size: 'sm' | 'md' | 'lg'; className?: string; children: React.ReactNode;[key: string]: any, onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
	const baseClasses = 'font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg';
	const variants = {
		primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/25',
		success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-green-500/25',
		secondary: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-gray-500/25',
		info: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-cyan-500/25',
		danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-red-500/25'
	};
	const sizes = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};
	const buttonRef = useRef<HTMLButtonElement>(null);
	const clickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
		if (onClick) {
			onClick(e);
		}

		if (buttonRef.current) {
			const link = buttonRef.current.querySelector('a');
			console.log('Link:', link);
			if (link) {
				e.preventDefault();
				link.click();
			}
		}
	}

	return (
		<button
			className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
			ref={buttonRef}
			{...props}
			onClick={clickHandler}
		>
			{children}
		</button>
	);
}

