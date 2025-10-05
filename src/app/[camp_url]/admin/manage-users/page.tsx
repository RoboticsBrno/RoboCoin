"use client";

import PageTitle from "@/components/PageTitle";
import MenuCard from "@/components/card/MenuCard";
import { useParams } from "next/navigation";

export default function Page() {
	const params = useParams();
	const campUrl = params.camp_url;
	return (
		<>
			<PageTitle>Manage Users</PageTitle>
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
					<MenuCard
						href={`/${campUrl}/admin/manage-users/new`}
						title="Create New User"
						description="Add a new user to the system with their details."
					/>
					<MenuCard
						href={`/${campUrl}/admin/manage-users/edit`}
						title="Edit Existing User"
						description="Modify the details of an existing user."
					/>
					<MenuCard
						href={`/${campUrl}/admin/manage-users/delete`}
						title="Delete User"
						description="Remove a user from the system."
					/>
				</div>
			</div>
		</>
	);
}
