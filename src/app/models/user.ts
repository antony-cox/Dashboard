export class User {
    _id: string;
    email: string;
    password: string;
    permissions: string[];
    token: string;
    intervalsId: string;
    intervalsKey: string;
    ftp: number;
    weight: number;
    active: boolean;
    theme: string;
}