import React from "react";
import { useUsers } from "../hooks/useUsers";
import { UserApiRepository } from "../../data/repositories/UserApiRepository";
import { FetchHttpClient } from "../../data/infrastructure/FetchHttpClient";
import { DataGrid } from "../components/ui/DataGrid";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Users, UserPlus, UserCheck, Download, BarChart2 as BarChart } from "lucide-react";
import type { User } from "../../domain/models/User";

const httpClient = new FetchHttpClient("https://jsonplaceholder.typicode.com");
const userRepository = new UserApiRepository(httpClient);

export const UserPage: React.FC = () => {
    const { users, loading, error } = useUsers(userRepository);

    const columns = [
        {
            header: "User",
            accessor: (user: User) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</span>
                    </div>
                </div>
            )
        },
        { header: "Email", accessor: "email" as keyof User },
        { header: "Phone", accessor: "phone" as keyof User },
        {
            header: "Website",
            accessor: (user: User) => (
                <a href={`https://${user.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    {user.website}
                </a>
            )
        },
        {
            header: "Actions",
            accessor: () => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                </div>
            )
        }
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
            {error}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your team members and their permissions.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" icon={<Download size={16} />}>Export</Button>
                    <Button icon={<UserPlus size={16} />}>Add User</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                            <BarChart size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Growth</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">+12%</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <DataGrid<User>
                    data={users}
                    columns={columns}
                    keyExtractor={(user) => user.id}
                />
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Showing {users.length} results</p>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" disabled>Previous</Button>
                        <Button variant="secondary" size="sm" disabled>Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};


