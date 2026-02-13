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
                username: "101893494",
                password: "9f3c4e2b7a1d8c6f0b2e49d7c8a3f5e1",
                grant_type: "password",
            },
            {
                "Content-Type": "application/x-www-form-urlencoded",
            }
        );
        return response.access_token;
    }
}
