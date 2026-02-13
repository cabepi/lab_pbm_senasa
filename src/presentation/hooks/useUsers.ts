import { useState, useEffect, useCallback } from "react";
import type { User } from "../../domain/models/User";
import type { UserRepository } from "../../domain/repositories/UserRepository";

export const useUsers = (repository: UserRepository) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await repository.getAll();
            setUsers(data);
        } catch (err) {
            setError("Failed to fetch users");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [repository]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, loading, error, refresh: fetchUsers };
};
