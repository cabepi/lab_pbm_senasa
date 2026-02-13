import type { HttpClient } from "../../domain/repositories/HttpClient";
import type { UserRepository } from "../../domain/repositories/UserRepository";
import type { User } from "../../domain/models/User";

export class UserApiRepository implements UserRepository {
    private http: HttpClient;
    private resource = "/users";

    constructor(http: HttpClient) {
        this.http = http;
    }

    async getAll(): Promise<User[]> {
        return this.http.get<User[]>(this.resource);
    }

    async getById(id: number): Promise<User | null> {
        try {
            return await this.http.get<User>(`${this.resource}/${id}`);
        } catch (e) {
            return null;
        }
    }

    async create(user: Omit<User, "id">): Promise<User> {
        return this.http.post<User>(this.resource, user);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async update(id: number | string, user: Partial<User>): Promise<User> {
        // JSONPlaceholder uses slightly different semantics, but standard REST usually does PUT or PATCH
        // Casting id to string if needed, depending on API
        return this.http.put<User>(`${this.resource}/${id}`, user);
    }

    async delete(id: number): Promise<void> {
        return this.http.delete(`${this.resource}/${id}`);
    }

    async findByEmail(email: string): Promise<User | null> {
        // In a real API, this might be a query param like ?email=...
        // For this example, we fetch all and filter client-side if API doesn't support it
        const users = await this.getAll();
        return users.find((u) => u.email === email) || null;
    }
}
