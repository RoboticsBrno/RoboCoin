export interface ItemFormData {
	title: string;
	description: string;
	price: number;
	status?: "pending" | "submitting" | "success" | "error";
	message?: string;
	existing?: boolean;
}
