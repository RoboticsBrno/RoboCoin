import Button from 'react-bootstrap/esm/Button';

export function BaseForm({
	children,
	className,
	...props
}: React.HTMLAttributes<HTMLFormElement>) {
	return (
		<form
			className={`max-md:min-w-full min-w-1/2  bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 ${className ?? ''}`}
			{...props}
		>
			{children}
		</form>
	);
}

export function FormGroup({
	children,
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={`mb-3 flex flex-col ${className ?? ''}`} {...props}>
			{children}
		</div>
	);
}

export function FormTitle({
	children,
	className,
	...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h2 className={`mb-4 ${className ?? ''}`} {...props}>
			{children}
		</h2>
	);
}

export function FormLabel({
	children,
	className,
	...props
}: React.HTMLAttributes<HTMLLabelElement>) {
	return (
		<label className={`form-label ${className ?? ''}`} {...props}>
			{children}
		</label>
	);
}

export function FormInput({
	children,
	className,
	...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			className={`form-control ${className ?? ''}`}
			{...props}
		>
			{children}
		</input>
	);
}

export function FormSubmit({
	children,
	className,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<Button
			type="submit"
			variant="success"
			className={`w-full ${className ?? ''}`}
			{...props}
		>
			{children}
		</Button>
	);
}
