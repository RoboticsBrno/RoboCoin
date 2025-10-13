import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";

export default async function IndexPage() {
	const spec = await getApiDocs();
	return (
		<section className="container bg-white py-2">
			<ReactSwagger spec={spec} />
		</section>
	);
}
