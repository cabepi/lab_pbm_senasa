export interface DatabaseClient {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
    close(): Promise<void>;
}
