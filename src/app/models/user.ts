export class User {
    _id: string;
    email: string;
    password: string;
    permissions: string[];
    token: string;
    active: boolean;
}