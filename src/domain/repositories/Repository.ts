export interface Repository<T> {
    getAll(params?: Record<string, any>): Promise<T[]>;
    getById(id: string | number): Promise<T | null>;
    create(entity: Omit<T, "id">): Promise<T>;
    update(id: string | number, entity: Partial<T>): Promise<T>;
    delete(id: string | number): Promise<void>;
}
