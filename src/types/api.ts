
export type RegisterBody = {
	email: string;
	password: string;
	role: 'NONE';
};

export type LoginBody = {
	email: string;
	password: string;
};
