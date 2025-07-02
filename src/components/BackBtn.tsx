import Link from "next/link"
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export function BackBtn({ ...props }) {
	return (
		<Button variant="secondary" size="md" className="mb-8 group" {...props}>
			<Link href="/dashboard" className="flex items-center gap-2">
				<ArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform duration-300" />
				Zpět
			</Link>
		</Button>
	);
}

