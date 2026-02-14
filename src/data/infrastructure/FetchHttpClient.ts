import type { HttpClient } from "../../domain/repositories/HttpClient";

export class FetchHttpClient implements HttpClient {
    private baseUrl: string;

    constructor(baseUrl: string = "") {
        this.baseUrl = baseUrl;
    }

    async get<T>(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
        const query = params ? `?${new URLSearchParams(params).toString()}` : "";
        const response = await fetch(`${this.baseUrl}${url}${query}`, {
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        });
        return this.handleResponse(response);
    }

    async post<T>(url: string, body: any, headers?: Record<string, string>): Promise<T> {
        const isUrlEncoded = headers?.["Content-Type"] === "application/x-www-form-urlencoded";
        const bodyContent = isUrlEncoded ? new URLSearchParams(body).toString() : JSON.stringify(body);

        const response = await fetch(`${this.baseUrl}${url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: bodyContent,
        });
        return this.handleResponse(response);
    }

    async put<T>(url: string, body: any, headers?: Record<string, string>): Promise<T> {
        const response = await fetch(`${this.baseUrl}${url}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: JSON.stringify(body),
        });
        return this.handleResponse(response);
    }

    async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
        const response = await fetch(`${this.baseUrl}${url}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        });
        return this.handleResponse(response);
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            try {
                const errorBody = await response.json();
                const errorMessage = errorBody.message || errorBody.ErrorMessage || `HTTP Error: ${response.status}`;
                const error = new Error(errorMessage);
                (error as any).body = errorBody;
                throw error;
            } catch (e: any) {
                if (e.body) throw e; // Rethrow if it's our custom error
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }
        }
        return response.json();
    }
}
