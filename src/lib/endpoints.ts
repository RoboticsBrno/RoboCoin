import { BACKEND_URL } from "@/config";
import { AcquiredItem, Item } from "@/types/item";
import { UserInfo, User, UserLeaderboard } from "@/types/user";

/*
	   /$$ /$$   /$$                                      
	  /$$/|__/  | $$                                      
	 /$$/  /$$ /$$$$$$    /$$$$$$  /$$$$$$/$$$$   /$$$$$$$
	/$$/  | $$|_  $$_/   /$$__  $$| $$_  $$_  $$ /$$_____/
   /$$/   | $$  | $$    | $$$$$$$$| $$ \ $$ \ $$|  $$$$$$ 
  /$$/    | $$  | $$ /$$| $$_____/| $$ | $$ | $$ \____  $$
 /$$/     | $$  |  $$$$/|  $$$$$$$| $$ | $$ | $$ /$$$$$$$/
|__/      |__/   \___/   \_______/|__/ |__/ |__/|_______/ 

*/

export async function getUserItems(id: string, token?: string): Promise<AcquiredItem[]> {
	const url = new URL(BACKEND_URL + '/items');
	url.searchParams.append('id', id);
	const response = await fetch(url, {
		method: "GET",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},

	});

	if (!response.ok) {
		throw new Error("Getting users items FAILED");
	}

	const data = await response.json();
	const output: AcquiredItem[] = data.map((item: { item: { id: number, name: string, description: string, price: number }, time: string }) => ({
		id: item.item.id,
		name: item.item.name,
		description: item.item.description,
		price: item.item.price,
		time: item.time
	}));
	return output;
}


export async function getAllItems(token?: string): Promise<Item[]> {
	const url = new URL(BACKEND_URL + '/items/all');
	const response = await fetch(url, {
		method: "GET",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
	});

	if (!response.ok) {
		throw new Error("Getting all items FAILED")
	}

	const data = await response.json();
	console.log("All items: ", data);
	return data;
}
export async function putItemUsers(id: string, ids: string[], token?: string): Promise<void> {
	console.log("Putting items users for item ID: ", id, " with user IDs: ", ids);
	const url = new URL(BACKEND_URL + '/items');
	url.searchParams.append('id', id);
	const response = await fetch(url, {
		method: "PUT",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ ids: ids }),
	});
	console.log("Putting items users: ", response);
	if (!response.ok) {
		throw new Error("Putting users items FAILED");
	}
}


/*
	   /$$ /$$   /$$                            
	  /$$/|__/  | $$                            
	 /$$/  /$$ /$$$$$$    /$$$$$$  /$$$$$$/$$$$ 
	/$$/  | $$|_  $$_/   /$$__  $$| $$_  $$_  $$
   /$$/   | $$  | $$    | $$$$$$$$| $$ \ $$ \ $$
  /$$/    | $$  | $$ /$$| $$_____/| $$ | $$ | $$
 /$$/     | $$  |  $$$$/|  $$$$$$$| $$ | $$ | $$
|__/      |__/   \___/   \_______/|__/ |__/ |__/

*/


export async function postItem(item: Item, token?: string): Promise<Item> {
	const url = new URL(BACKEND_URL + '/item');
	const response = await fetch(url, {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(item),
	});

	if (!response.ok) {
		console.error("Posting item FAILED: ", response);
		throw new Error("Posting item FAILED")
	}

	const data = await response.json();
	console.log("Posted item: ", data);
	return data;
}

export async function putItem(item: Item, token?: string): Promise<Item> {
	const url = new URL(BACKEND_URL + '/item');
	url.searchParams.append('id', String(item.id));
	const response = await fetch(url, {
		method: "PUT",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(item),
	});

	if (!response.ok) {
		console.error("Updating item FAILED: ", response);
		throw new Error("Updating item FAILED")
	}

	const data = await response.json();
	console.log("Updated item: ", data);
	return data;
}

export async function getItem(id: string, token?: string): Promise<Item> {
	const url = new URL(BACKEND_URL + '/item');
	url.searchParams.append('id', id);
	const response = await fetch(url, {
		method: "GET",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},

	});

	if (!response.ok) {
		console.error("Finding item by ID failed: ", response);
		throw new Error("Finding item by ID failed")
	}

	const data = await response.json();
	console.log("Item data: ", data);
	return {
		id: data.id,
		name: data.name,
		description: data.description,
		price: data.price,
	};
}

export async function deleteItem(id: string, token?: string): Promise<void> {
	const url = new URL(BACKEND_URL + '/item');
	url.searchParams.append('id', id);
	const response = await fetch(url, {
		method: "DELETE",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
	});
	console.log("Deleting item: ", response);
	if (!response.ok) {
		console.error("Deleting item FAILED: ", response);
		throw new Error("Deleting item FAILED")
	}

	console.log("Item deleted successfully");
}

export async function removeItemUsers(item: Item, users: User[], token?: string): Promise<Item> {
	const ids = users.map(user => user.id).join(',');
	const url = new URL(BACKEND_URL + '/item');
	url.searchParams.append('id', String(item.id));
	url.searchParams.append('items', `[${ids}]`);
	const response = await fetch(url, {
		method: "DELETE",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(item),
	});

	if (!response.ok) {
		console.error("Updating item FAILED: ", response);
		throw new Error("Updating item FAILED")
	}

	const data = await response.json();
	console.log("Updated item: ", data);
	return data;
}

/*
	   /$$                                      
	  /$$/                                      
	 /$$//$$   /$$  /$$$$$$$  /$$$$$$   /$$$$$$ 
	/$$/| $$  | $$ /$$_____/ /$$__  $$ /$$__  $$
   /$$/ | $$  | $$|  $$$$$$ | $$$$$$$$| $$  \__/
  /$$/  | $$  | $$ \____  $$| $$_____/| $$      
 /$$/   |  $$$$$$/ /$$$$$$$/|  $$$$$$$| $$      
|__/     \______/ |_______/  \_______/|__/      

*/
export async function getUser(id: string, token?: string): Promise<{ info: UserInfo, user: User }> {
	const url = new URL(BACKEND_URL + '/user');
	url.searchParams.append('id', id);
	const response = await fetch(url, {
		method: "GET",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},

	});

	if (!response.ok) {
		throw new Error("Finding user by ID failed")
	}
	const data = await response.json()
	console.log("User data: ", data);
	const output = {
		info: {
			items: data.detiStats.items,
			score: data.detiStats.score || 0,
			rank: data.detiStats.rank,
		},
		user: {
			id: data.deti.id,
			name: data.deti.name,
		}
	};
	return output;
}

/*
	   /$$                                                
	  /$$/                                                
	 /$$//$$   /$$  /$$$$$$$  /$$$$$$   /$$$$$$   /$$$$$$$
	/$$/| $$  | $$ /$$_____/ /$$__  $$ /$$__  $$ /$$_____/
   /$$/ | $$  | $$|  $$$$$$ | $$$$$$$$| $$  \__/|  $$$$$$ 
  /$$/  | $$  | $$ \____  $$| $$_____/| $$       \____  $$
 /$$/   |  $$$$$$/ /$$$$$$$/|  $$$$$$$| $$       /$$$$$$$/
|__/     \______/ |_______/  \_______/|__/      |_______/ 

*/
export async function getItemUsers(id: string, token?: string): Promise<User[]> {
	const url = new URL(BACKEND_URL + '/users');
	url.searchParams.append('id', String(id));
	const response = await fetch(url, {
		method: "GET",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},

	});
	if (!response.ok) {
		throw new Error("Getting items users FAILED");
	}

	const data = await response.json();
	const output: User[] = data.map((user: { id: number, name: string }) => ({
		id: user.id,
		name: user.name,
	}));
	return output;
}

export async function getAllUsers(token?: string): Promise<User[]> {
	const url = new URL(BACKEND_URL + '/users/all');
	const response = await fetch(url, {
		method: "GET",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
	});

	if (!response.ok) {
		console.error("Getting all users FAILED: ", response);
		throw new Error("Getting all users FAILED")
	}

	const data = await response.json();
	return data;
}

export async function putUserItems(id: string, ids: string[], token?: string): Promise<void> {
	console.log("Putting users items for user ID: ", id, " with item IDs: ", ids);
	const url = new URL(BACKEND_URL + '/users');
	url.searchParams.append('id', id);
	const response = await fetch(url, {
		method: "PUT",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ ids: ids }),
	});
	console.log("Putting users items: ", response);
	if (!response.ok) {
		throw new Error("Putting users items FAILED");
	}
}

/*
	   /$$ /$$                        
	  /$$/| $$                        
	 /$$//$$$$$$    /$$$$$$   /$$$$$$ 
	/$$/|_  $$_/   /$$__  $$ /$$__  $$
   /$$/   | $$    | $$  \ $$| $$  \ $$
  /$$/    | $$ /$$| $$  | $$| $$  | $$
 /$$/     |  $$$$/|  $$$$$$/| $$$$$$$/
|__/       \___/   \______/ | $$____/ 
							| $$      
							| $$      
							|__/      
*/

export async function getTop(token?: string): Promise<UserLeaderboard[]> {
	const url = new URL(BACKEND_URL + '/top');
	const response = await fetch(url, {
		method: "GET",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
	});

	if (!response.ok) {
		console.error("Getting top users FAILED: ", response);
		throw new Error("Getting top users FAILED")
	}

	const data = await response.json();
	console.log("Top users: ", data);
	return data;
}

/*
	   /$$ /$$            /$$$$$$         
	  /$$/|__/           /$$__  $$        
	 /$$/  /$$ /$$$$$$$ | $$  \__//$$$$$$ 
	/$$/  | $$| $$__  $$| $$$$   /$$__  $$
   /$$/   | $$| $$  \ $$| $$_/  | $$  \ $$
  /$$/    | $$| $$  | $$| $$    | $$  | $$
 /$$/     | $$| $$  | $$| $$    |  $$$$$$/
|__/      |__/|__/  |__/|__/     \______/ 

*/

export async function getInfo(token?: string): Promise<{ users: number, points: number, achievements: number }> {
	const url = new URL(BACKEND_URL + '/info');
	const response = await fetch(url, {
		method: "GET",
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
	});

	if (!response.ok) {
		console.error("Getting info FAILED: ", response);
		throw new Error("Getting info FAILED")
	}

	const data = await response.json();
	console.log("Info: ", data);
	return {
		users: data.players || 0,
		points: data.scores || 0,
		achievements: data.items || 0
	};
}

/*
	   /$$              /$$               /$$          
	  /$$/             | $$              |__/          
	 /$$//$$$$$$   /$$$$$$$ /$$$$$$/$$$$  /$$ /$$$$$$$ 
	/$$/|____  $$ /$$__  $$| $$_  $$_  $$| $$| $$__  $$
   /$$/  /$$$$$$$| $$  | $$| $$ \ $$ \ $$| $$| $$  \ $$
  /$$/  /$$__  $$| $$  | $$| $$ | $$ | $$| $$| $$  | $$
 /$$/  |  $$$$$$$|  $$$$$$$| $$ | $$ | $$| $$| $$  | $$
|__/    \_______/ \_______/|__/ |__/ |__/|__/|__/  |__/

*/

export async function checkToken(token?: string): Promise<boolean> {
	const url = new URL(BACKEND_URL + '/admin');
	url.searchParams.append('token', token || '');

	const response = await fetch(url, {
		method: "GET",
	});

	if (!response.ok) {
		console.error("Token check FAILED: ", response);
		return false;
	}

	const data = await response.json();
	console.log("Token check result: ", data);
	return data.valid;
}

