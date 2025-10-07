"use client";

import MenuCard from "@/components/card/MenuCard";
import PageTitle from "@/components/PageTitle";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";
import { useToast } from "@/components/Toast";

export default function Home() {
	const [loading, setLoading] = useState(true);
	const { showError } = useToast();

	const [camps, setCamps] = useState<any[]>([]);

	const { data: session, status, update } = useSession();

	useEffect(() => {
		if (status === "loading") return;

		const clearCampAndFetchCamps = async () => {
			if (session && session.camp_url) {
				await update({
					camp_url: null,
					camp_id: null,
					user: {
						...session.user,
						is_admin: false,
						is_org: false,
					},
				});
				return;
			}

			if (!session) {
				setLoading(false);
				return;
			}

			try {
				const response = await fetch(`/api/manager/my-camps`);
				if (!response.ok) {
					showError("Failed to fetch camps");
					throw new Error("Failed to fetch camps");
				}
				const data = await response.json();
				setCamps(data);
			} catch (error) {
				console.error("Error fetching camps:", error);
				showError("An unexpected error occurred while fetching camps.");
			} finally {
				setLoading(false);
			}
		};

		clearCampAndFetchCamps();
	}, [session, status, update, showError]);

	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gray-800 p-4 rounded-lg justify-items-center">
				<MenuCard
					title="Create a new camp"
					description="Start a new camping adventure by creating a camp."
					href="/create-camp"
				/>
			</div>
			<div className="pt-6">
				<PageTitle>Your camps</PageTitle>
				{loading ? (
					<Loader />
				) : camps.length === 0 ? (
					<p className="text-gray-300">You have no camps yet.</p>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-lg justify-items-center mt-4">
						{camps.map((camp, index) => (
							<Camp
								key={index}
								title={camp.name}
								description={camp.description}
								name_url={camp.name_url}
							/>
						))}
					</div>
				)}
			</div>
		</>
	);
}

function Camp({
	title,
	description,
	name_url,
}: {
	title: string;
	description: string;
	name_url: string;
}) {
	return (
		<div className="bg-gray-700 text-white p-4 rounded-lg w-full text-center">
			<h2>{title}</h2>
			<p>{description}</p>
			<div className="mt-2">
				<Link href={`/${name_url}`}>
					<button className="bg-blue-500 hover:bg-blue-700  text-white font-bold py-2 px-4 rounded mb-2">
						Go to Camp
					</button>
				</Link>
				<Link href={`/edit-camp/${name_url}`}>
					<button className="bg-yellow-600 hover:bg-yellow-700  text-white font-bold py-2 px-4 rounded ml-2 mb-2">
						Edit Camp
					</button>
				</Link>
				<Link href={`/add-managers/${name_url}`}>
					<button className="bg-green-500 hover:bg-green-700  text-white font-bold py-2 px-4 rounded ml-2 mb-2">
						Add Managers
					</button>
				</Link>

				<Link href={`/manage-users/${name_url}`}>
					<button className="bg-purple-500 hover:bg-purple-700  text-white font-bold py-2 px-4 rounded ml-2 mb-2">
						Manage Users
					</button>
				</Link>
			</div>
		</div>
	);
}
