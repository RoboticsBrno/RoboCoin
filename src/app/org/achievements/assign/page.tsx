"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import FormContainer from "@/components/form/FormContainer";
import FormTitle from "@/components/form/FormTitle";
import FormSubtitle from "@/components/form/FormSubtitle";
import FormGroup from "@/components/form/FormGroup";
import FormSubmit from "@/components/form/FormSubmit";

// Define types for the data we'll fetch
interface User {
	id: number;
	name: string;
	login: string;
}

interface Item {
	id: number;
	title: string;
}

// Zod schema for the form validation
const assignAchievementSchema = z.object({
	userId: z.string().min(1, { message: "Please select a user" }),
	itemId: z.string().min(1, { message: "Please select an achievement" }),
});

type AssignAchievementSchema = z.infer<typeof assignAchievementSchema>;

export default function AssignAchievementPage() {
	const router = useRouter();
	const [users, setUsers] = useState<User[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch users and items when the component mounts
	useEffect(() => {
		const fetchData = async () => {
			try {
				const [usersRes, itemsRes] = await Promise.all([
					fetch("/api/users"),
					fetch("/api/items"),
				]);
				const usersData = await usersRes.json();
				const itemsData = await itemsRes.json();
				setUsers(usersData);
				setItems(itemsData);
			} catch (error) {
				console.error("Failed to fetch data:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	const handleSubmit = async (data: AssignAchievementSchema) => {
		try {
			const response = await fetch("/api/inventory", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				router.push("/org/achievements");
			} else {
				const errorData = await response.json();
				console.error("Failed to assign achievement:", errorData.error);
			}
		} catch (error) {
			console.error("An unexpected error occurred:", error);
		}
	};

	if (isLoading) {
		return (
			<p className="text-center text-gray-400">Loading form data...</p>
		);
	}

	return (
		<FormContainer<AssignAchievementSchema>
			onSubmit={handleSubmit}
			schema={assignAchievementSchema}
		>
			<FormTitle>Assign Achievement</FormTitle>
			<FormSubtitle>
				Select a user and the achievement you want to award.
			</FormSubtitle>

			<FormGroup>
				<label
					htmlFor="userId"
					className="block text-sm font-medium text-gray-300"
				>
					User
				</label>
				<select
					id="userId"
					name="userId"
					className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
				>
					<option value="">-- Select a User --</option>
					{users.map((user) => (
						<option key={user.id} value={user.id.toString()}>
							{user.name} ({user.login})
						</option>
					))}
				</select>
			</FormGroup>

			<FormGroup>
				<label
					htmlFor="itemId"
					className="block text-sm font-medium text-gray-300"
				>
					Achievement
				</label>
				<select
					id="itemId"
					name="itemId"
					className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
				>
					<option value="">-- Select an Achievement --</option>
					{items.map((item) => (
						<option key={item.id} value={item.id.toString()}>
							{item.title}
						</option>
					))}
				</select>
			</FormGroup>

			<FormSubmit>Assign Achievement</FormSubmit>
		</FormContainer>
	);
}
