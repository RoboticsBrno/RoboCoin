import Button from "react-bootstrap/esm/Button"
import Link from "next/link"

export function BackBtn() {
	return (
		<Button variant='secondary' className='mb-3'>
			<Link href="/dashboard">Zpět na přehled</Link>
		</Button>
	)
}
