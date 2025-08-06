export default function PageTitle({ children }: { children: React.ReactNode }) {
	return (
		<h1 className="text-4xl font-bold text-white mb-8 text-center">
			{children}
		</h1>
	);
}
