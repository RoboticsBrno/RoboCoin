export default function UnauthorizedPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<h1 className="text-4xl font-bold text-red-500">
				Neoprávněný přístup
			</h1>
			<p className="mt-4 text-lg text-gray-400">
				Nemáte oprávnění k přístupu na tuto stránku.
			</p>
		</div>
	);
}
