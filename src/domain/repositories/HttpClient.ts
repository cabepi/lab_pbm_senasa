export interface HttpClient {
    get<T>(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<T>;
    post<T>(url: string, body: any, headers?: Record<string, string>): Promise<T>;
    put<T>(url: string, body: any, headers?: Record<string, string>): Promise<T>;
    delete<T>(url: string, headers?: Record<string, string>): Promise<T>;
}
