"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import FormContainer from "@/components/form/FormContainer";
import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormSelect from "@/components/form/FormSelect";
import FormSubmit from "@/components/form/FormSubmit";
import FormTitle from "@/components/form/FormTitle";
import { useBalance } from "@/hooks/useBalance";
import Loader from "@/components/Loader";
import { useToast } from "@/components/Toast";
import { useParams } from "next/navigation";

interface User {
	id: number;
	name: string;
}

export default function TransferPage() {
	const { camp_url } = useParams<{ camp_url: string }>();
	const [loading, setLoading] = useState<boolean>(true);
	const [users, setUsers] = useState<User[]>([]);
	const { data: session } = useSession();
	const { balance, mutate } = useBalance();

	const transferSchema = useMemo(() => {
		return z.object({
			recipient: z.string().min(1, "Je vyžadován příjemce"),
			amount: z
				.string()
				.min(1, "Je vyžadována částka")
				.refine((val) => {
					const num = Number(val);
					return !isNaN(num) && num > 0 && Number.isInteger(num);
				}, "Částka musí být kladné celé číslo")
				.refine((val) => {
					const num = Number(val);
					return num <= (balance ?? 0);
				}, "Částka nemůže překročit váš zůstatek"),
			description: z
				.string()
				.max(255, "Popis nemůže překročit 255 znaků")
				.optional(),
		});
	}, [balance]);

	type TransferSchema = z.infer<typeof transferSchema>;

	const methods = useForm<TransferSchema>({
		resolver: zodResolver(transferSchema),
	});

	const { showError, showSuccess } = useToast();

	const { handleSubmit } = methods;

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setLoading(true);
				const response = await fetch("/api/users?camp_url=" + camp_url);
				if (response.ok) {
					const data = await response.json();
					if (session?.user?.id) {
						setUsers(
							data.filter(
								(user: User) =>
									user.id != parseInt(session.user?.id)
							)
						);
					} else {
						setUsers(data);
					}
				}
			} catch (err) {
				showError("Nepodařilo se načíst uživatele.");
				console.error("Error fetching users:", err);
			}
			setLoading(false);
		};
		fetchUsers();
	}, [session, camp_url, showError]);

	const onSubmit = async (data: TransferSchema) => {
		const response = await fetch("/api/transfer", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				to: data.recipient,
				amount: Number(data.amount),
				description: data.description,
			}),
		});

		const result = await response.json();

		if (response.ok) {
			showSuccess("Převod úspěšný!");
			methods.reset();
			mutate();
		} else {
			showError("Došlo k neočekávané chybě.");
			console.error("Transfer error:", result);
		}
	};

	const userOptions = users.map((user) => ({
		value: user.id.toString(),
		label: user.name,
	}));

	return (
		<>
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onSubmit)}>
					<FormTitle>Převést zůstatek</FormTitle>
					{loading ? (
						<Loader />
					) : (
						<>
							<FormGroup>
								<FormSelect
									label="Příjemce"
									name="recipient"
									options={userOptions}
									required
								/>
							</FormGroup>
							<FormGroup>
								<FormInput
									label="Částka"
									type="number"
									name="amount"
									required
								/>
							</FormGroup>
							<FormGroup>
								<FormInput
									label="Popis (volitelný)"
									type="text"
									name="description"
									maxLength={255}
								/>
							</FormGroup>
							<FormSubmit>Převést</FormSubmit>
						</>
					)}
				</FormContainer>
			</FormProvider>
		</>
	);
}
