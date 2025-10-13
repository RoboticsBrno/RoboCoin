import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
	const spec = createSwaggerSpec({
		apiFolder: "src/app/api",
		definition: {
			openapi: "3.0.0",
			info: {
				title: "Robocoin API",
				version: "1.0",
			},
			tags: [
				{
					name: "Achievements",
					description: "Operations related to user achievements",
				},
				{
					name: "Balance",
					description: "Operations related to user balance",
				},
				{
					name: "Camps",
					description: "Operations related to camps",
				},
				{
					name: "Inventory",
					description: "Operations related to user inventory",
				},
				{
					name: "Items",
					description: "Operations related to items",
				},
				{
					name: "Manager",
					description: "Operations for managers",
				},
				{
					name: "Marketplace",
					description: "Operations related to the marketplace",
				},
				{
					name: "Transactions",
					description: "Operations related to transactions",
				},
				{
					name: "Users",
					description: "Operations related to users",
				},
			],
			components: {
				securitySchemes: {
					BearerAuth: {
						type: "http",
						scheme: "bearer",
						bearerFormat: "JWT",
					},
				},
				schemas: {
					User: {
						type: "object",
						properties: {
							id: { type: "integer" },
							login: { type: "string" },
							name: { type: "string" },
							is_manager: { type: "boolean" },
						},
					},
					Item: {
						type: "object",
						properties: {
							id: { type: "integer" },
							title: { type: "string" },
							description: { type: "string" },
							price: { type: "integer" },
							on_marketplace: { type: "boolean" },
							from_marketplace: { type: "boolean" },
							owner: { type: "integer" },
							camp: { type: "integer" },
							created_at: { type: "string", format: "date-time" },
							updated_at: { type: "string", format: "date-time" },
							user: { "$ref": "#/components/schemas/User" },
						},
					},
					InventoryItem: {
						type: "object",
						properties: {
							id: { type: "integer" },
							user: { type: "integer" },
							item: { type: "integer" },
							quantity: { type: "integer" },
							camp: { type: "integer" },
							item_inventory_itemToitem: {
								"$ref": "#/components/schemas/Item",
							},
						},
					},
					Camp: {
						type: "object",
						properties: {
							id: { type: "integer" },
							name: { type: "string" },
							name_url: { type: "string" },
							currency: { type: "string" },
							description: { type: "string" },
						},
					},
					CampDetails: {
						allOf: [
							{ "$ref": "#/components/schemas/Camp" },
							{
								type: "object",
								properties: {
									is_admin: { type: "boolean" },
									is_org: { type: "boolean" },
								},
							},
						],
					},
					Balance: {
						type: "object",
						properties: {
							id: { type: "integer" },
							user: { type: "integer" },
							amount: { type: "integer" },
							camp: { type: "integer" },
						},
					},
					CreateCampResponse: {
						type: "object",
						properties: {
							user: { type: "integer" },
							balance: { "$ref": "#/components/schemas/Balance" },
						},
					},
					InventoryWithUserAndItem: {
						type: "object",
						properties: {
							userLogin: { type: "string" },
							itemTitle: { type: "string" },
							quantity: { type: "integer" },
						},
					},
					ItemWithUser: {
						allOf: [
							{ "$ref": "#/components/schemas/Item" },
							{
								type: "object",
								required: ["user"],
								properties: {
									user: { "$ref": "#/components/schemas/User" },
								},
							},
						],
					},
					UserItems: {
						type: "object",
						additionalProperties: {
							type: "object",
							additionalProperties: {
								type: "boolean",
							},
						},
						example: {
							"user1_login": {
								"item1_title": true,
								"item2_title": false,
							},
							"user2_login": {
								"item1_title": true,
								"item3_title": true,
							},
						},
					},
					Transaction: {
						type: "object",
						properties: {
							id: { type: "integer" },
							item: { type: "integer" },
							sender: { type: "integer" },
							receiver: { type: "integer" },
							amount: { type: "integer" },
							created_at: { type: "string", format: "date-time" },
							description: { type: "string" },
							camp: { type: "integer" },
							transaction_type: { type: "string", enum: ["transfer", "purchase"] },
						},
					},
					TransactionWithUsers: {
						allOf: [
							{ "$ref": "#/components/schemas/Transaction" },
							{
								type: "object",
								properties: {
									user_transaction_senderTouser: { "$ref": "#/components/schemas/User" },
									user_transaction_receiverTouser: { "$ref": "#/components/schemas/User" },
								},
							},
						],
					},
				},
			},
			security: [],
		},
	});
	return spec;
};
