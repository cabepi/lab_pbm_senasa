import type { HttpClient } from "../../domain/repositories/HttpClient";

export class UnipagoAuthRepository {
    private http: HttpClient;
    private baseUrl: string;

    constructor(http: HttpClient, baseUrl: string) {
        this.http = http;
        this.baseUrl = baseUrl;
    }

    async authenticate(): Promise<string> {
        const response = await this.http.post<{ access_token: string }>(
            `${this.baseUrl}/Autenticar`,
            {
                username: import.meta.env.VITE_SENASA_USERNAME,
                password: import.meta.env.VITE_SENASA_PASSWORD,
                grant_type: "password",
            },
            {
                "Content-Type": "application/x-www-form-urlencoded",
            }
        );
        return response.access_token;
    }
}
