"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import FormContainer from "@/components/form/FormContainer";
import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormSelect from "@/components/form/FormSelect";
import FormSubmit from "@/components/form/FormSubmit";
import Alert from "@/components/Alert";
import FormTitle from "@/components/form/FormTitle";
import { useBalance } from "@/hooks/useBalance";
import Loader from "@/components/Loader";

interface User {
	id: number;
	name: string;
}

export default function TransferPage() {
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [users, setUsers] = useState<User[]>([]);
	const router = useRouter();
	const { data: session } = useSession();
	const { refreshBalance, balance } = useBalance();

	const transferSchema = useMemo(() => {
		return z.object({
			recipient: z.string().min(1, "Recipient is required"),
			amount: z.coerce
				.number()
				.int()
				.positive("Amount must be a positive integer")
				.max(balance ?? 0, "Amount cannot exceed your balance"),
			description: z
				.string()
				.max(255, "Description cannot exceed 255 characters")
				.optional(),
		});
	}, [balance]);

	type TransferSchema = z.infer<typeof transferSchema>;

	const methods = useForm<TransferSchema>({
		resolver: zodResolver(transferSchema),
	});

	const { handleSubmit } = methods;

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setLoading(true);
				const response = await fetch("/api/users");
				if (response.ok) {
					const data = await response.json();
					if (session?.user?.id) {
						setUsers(
							data.filter(
								(user: User) => user.id != session.user?.id
							)
						);
					} else {
						setUsers(data);
					}
				}
			} catch (err) {
				setError("Failed to fetch users.");
			}
			setLoading(false);
		};
		fetchUsers();
	}, [session]);

	const onSubmit = async (data: TransferSchema) => {
		setError(null);
		setSuccess(null);

		const response = await fetch("/api/transfer", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				to: data.recipient,
				amount: data.amount,
				description: data.description,
			}),
		});

		const result = await response.json();

		if (response.ok) {
			setSuccess("Transfer successful!");
			methods.reset();
			refreshBalance();
			router.refresh();
		} else {
			setError(result.error || "An unexpected error occurred.");
		}
	};

	const userOptions = users.map((user) => ({
		value: user.id.toString(),
		label: user.name,
	}));

	return (
		<>
			{error && <Alert variant="danger" message={error} />}
			{success && <Alert variant="success" message={success} />}
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onSubmit)}>
					<FormTitle>Transfer Balance</FormTitle>
					{loading ? (
						<Loader />
					) : (
						<>
							<FormGroup>
								<FormSelect
									label="Recipient"
									name="recipient"
									options={userOptions}
									required
								/>
							</FormGroup>
							<FormGroup>
								<FormInput
									label="Amount"
									type="number"
									name="amount"
									required
								/>
							</FormGroup>
							<FormGroup>
								<FormInput
									label="Description (optional)"
									type="text"
									name="description"
									maxLength={255}
								/>
							</FormGroup>
							<FormSubmit>Transfer</FormSubmit>
						</>
					)}
				</FormContainer>
			</FormProvider>
		</>
	);
}
