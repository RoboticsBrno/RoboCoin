'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

interface CampData {
	id: string;
	name_url: string;
	is_admin: boolean;
	is_org: boolean;
}

export default function CampLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, update, status } = useSession();
	const params = useParams();
	const pathname = usePathname();
	const router = useRouter();
	const [isSessionReady, setIsSessionReady] = useState(false);


	const campUrl = params.camp_url as string;

	useEffect(() => {
		const checkSession = async () => {
			if (status === 'loading') return;

			if (session && campUrl && session.camp_url !== campUrl) {
				await updateSessionWithCampData();
			} else if (session) {
				setIsSessionReady(true);
			}
		};

		checkSession();
	}, [session, campUrl, status]);

	const updateSessionWithCampData = async () => {
		try {
			const response = await fetch(`/api/camps/${campUrl}`);

			if (response.ok) {
				const campData: CampData = await response.json();

				await update({
					camp_url: campData.name_url,
					camp_id: parseInt(campData.id, 10),
					user: {
						...session?.user,
						is_admin: campData.is_admin,
						is_org: campData.is_org,
					},
				});
				setIsSessionReady(true);
			} else {
				router.push('/unauthorized');
			}
		} catch (error) {
			console.error('Error updating session with camp data:', error);
		}
	};

	if (pathname.includes('login') || pathname.includes('signup')) {
		return <>{children}</>;
	}

	if (!isSessionReady) {
		return <Loader />;
	}

	return <>{children}</>;
}