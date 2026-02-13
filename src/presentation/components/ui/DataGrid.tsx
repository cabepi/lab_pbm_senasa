import React from "react";
import { ChevronRight } from "lucide-react";

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface DataGridProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    onRowClick?: (item: T) => void;
}

export const DataGrid = <T,>({ data, columns, keyExtractor, onRowClick }: DataGridProps<T>) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">No data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-6 py-4 w-12"></th> {/* Expansion chevron column */}
                            {columns.map((col, index) => (
                                <th key={index} scope="col" className={`px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${col.className || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {data.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                onClick={() => onRowClick && onRowClick(item)}
                                className="hover:bg-blue-50/30 transition-colors duration-150 group cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-gray-400 group-hover:text-blue-500 transition-colors">
                                    <ChevronRight size={16} />
                                </td>
                                {columns.map((col, index) => (
                                    <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                        {typeof col.accessor === "function"
                                            ? col.accessor(item)
                                            : (item[col.accessor] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Footer Pagination Placeholder */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Mostrando 1-10 de {data.length}</span>
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-50" disabled>Anterior</button>
                    <button className="p-1 hover:bg-gray-100 rounded">Siguiente</button>
                </div>
            </div>
        </div>
    );
};
