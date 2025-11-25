"use client";

import { usePathname } from "next/navigation";
import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";

const variants = {
	primary: "bg-blue-900 border-blue-700 text-blue-200",
	secondary: "bg-gray-700 border-gray-600 text-gray-200",
	success: "bg-green-900 border-green-700 text-green-200",
	danger: "bg-red-900 border-red-700 text-red-200",
	warning: "bg-yellow-900 border-yellow-700 text-yellow-200",
	info: "bg-sky-900 border-sky-700 text-sky-200",
};

const progressBarVariants = {
	primary: "bg-blue-400",
	secondary: "bg-gray-400",
	success: "bg-green-400",
	danger: "bg-red-400",
	warning: "bg-yellow-400",
	info: "bg-sky-400",
};

interface Toast {
	id: number;
	message: string;
	variant: keyof typeof variants;
}

interface ToastContextType {
	showToast: (message: string, variant?: keyof typeof variants) => void;
	showSuccess: (message: string) => void;
	showError: (message: string) => void;
	showWarning: (message: string) => void;
	showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const [nextId, setNextId] = useState(0);
	const pathname = usePathname();

	useEffect(() => {
		setToasts([]);
	}, [pathname]);

	const showToast = useCallback(
		(message: string, variant: keyof typeof variants = "info") => {
			setToasts((prev) => {
				const isDuplicate = prev.some(
					(toast) =>
						toast.message === message && toast.variant === variant
				);
				if (isDuplicate) {
					return prev;
				}
				const id = nextId;
				setNextId((n) => n + 1);
				return [...prev, { id, message, variant }];
			});
		},
		[nextId, setNextId]
	);

	const showSuccess = useCallback(
		(message: string) => {
			showToast(message, "success");
		},
		[showToast]
	);

	const showError = useCallback(
		(message: string) => {
			showToast(message, "danger");
		},
		[showToast]
	);

	const showWarning = useCallback(
		(message: string) => {
			showToast(message, "warning");
		},
		[showToast]
	);

	const showInfo = useCallback(
		(message: string) => {
			showToast(message, "info");
		},
		[showToast]
	);

	const removeToast = useCallback((id: number) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	return (
		<ToastContext.Provider
			value={{ showToast, showSuccess, showError, showWarning, showInfo }}
		>
			{children}
			<div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
				{toasts.map((toast) => (
					<ToastAlert
						key={toast.id}
						message={toast.message}
						variant={toast.variant}
						onClose={() => removeToast(toast.id)}
					/>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}

function ToastAlert({
	message,
	variant,
	onClose,
}: {
	message: string;
	variant: keyof typeof variants;
	onClose: () => void;
}) {
	const [isVisible, setIsVisible] = useState(true);

	const handleClose = useCallback(() => {
		setIsVisible(false);
		setTimeout(onClose, 300);
	}, [onClose]);

	useEffect(() => {
		const timer = setTimeout(() => {
			handleClose();
		}, 5000);

		return () => clearTimeout(timer);
	}, [handleClose]);

	const variantClasses = variants[variant];
	const progressBarClass = progressBarVariants[variant];

	return (
		<div
			className={`relative border-l-4 rounded-md shadow-lg transition-all duration-300 overflow-hidden ${variantClasses} ${
				isVisible
					? "opacity-100 translate-x-0"
					: "opacity-0 translate-x-full"
			}`}
			role="alert"
		>
			<div className="p-4">
				<div className="flex items-start">
					<div className="flex-grow">
						<p className="text-md font-medium">{message}</p>
					</div>
					<div className="ml-auto pl-3">
						<button
							type="button"
							onClick={handleClose}
							className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantClasses}`}
						>
							<span className="sr-only">Zavřít</span>
							<svg
								className="h-5 w-5"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Progress bar */}
			<div
				className={`absolute bottom-0 left-0 right-0 h-1 bg-opacity-20 bg-transparent`}
			>
				<div
					className={`h-full animate-shrink ${progressBarClass}`}
					style={{
						width: "100%",
					}}
				/>
			</div>

			<style jsx>{`
				@keyframes shrink {
					from {
						width: 100%;
					}
					to {
						width: 0%;
					}
				}
				.animate-shrink {
					animation: shrink 5s linear forwards;
				}
			`}</style>
		</div>
	);
}
