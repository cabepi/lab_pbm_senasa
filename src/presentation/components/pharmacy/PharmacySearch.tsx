import React, { useState, useEffect } from "react";
import type { Pharmacy } from "../../../domain/models/Pharmacy";
import { PharmacyRepository } from "../../../data/repositories/PharmacyRepository";
import { Input } from "../ui/Input";
import { Search, Loader2, Building2 } from "lucide-react";

function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

interface PharmacySearchProps {
    onSelect: (pharmacy: Pharmacy | null) => void;
    selectedPharmacy?: Pharmacy | null;
}

export const PharmacySearch: React.FC<PharmacySearchProps> = ({ onSelect, selectedPharmacy }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Pharmacy[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const debouncedQuery = useDebounceValue(query, 500);
    const repository = new PharmacyRepository();

    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults([]);
            return;
        }

        const search = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await repository.search(debouncedQuery);
                setResults(data);
            } catch (err) {
                console.error(err);
                setError("Error al buscar farmacias.");
            } finally {
                setIsLoading(false);
            }
        };

        search();
    }, [debouncedQuery]);

    return (
        <div className="space-y-4">
            <div className="relative">
                <Input
                    label="Buscar Farmacia"
                    placeholder="Ingrese código, nombre o tipo..."
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                    icon={isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                    className="py-1"
                />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {results.length > 0 && !selectedPharmacy && (
                <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {results.map((pharmacy) => (
                                <tr
                                    key={pharmacy.code}
                                    onClick={() => {
                                        onSelect(pharmacy);
                                        setQuery("");
                                        setResults([]);
                                    }}
                                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{pharmacy.code}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{pharmacy.name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{pharmacy.principal_code}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{pharmacy.type}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedPharmacy && (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-700">
                    <div className="flex items-center gap-2">
                        <Building2 size={20} />
                        <div>
                            <p className="font-medium text-sm">{selectedPharmacy.name}</p>
                            <p className="text-xs opacity-80">Código: {selectedPharmacy.code} | Principal: {selectedPharmacy.principal_code} | Tipo: {selectedPharmacy.type}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onSelect(null)}
                        className="text-xs underline hover:text-blue-800"
                    >
                        Cambiar
                    </button>
                </div>
            )}
        </div>
    );
};
