import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Pill, Search, Loader2, X } from 'lucide-react';
import type { Medication } from '../../../domain/models/Authorization';
import type { MedicationItem } from '../../../domain/models/MedicationItem';
import { MedicationItemRepository } from '../../../data/repositories/MedicationItemRepository';

function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface MedicationFormProps {
    onAdd: (medication: Medication) => void;
}

export const MedicationForm: React.FC<MedicationFormProps> = ({ onAdd }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MedicationItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMed, setSelectedMed] = useState<MedicationItem | null>(null);
    const [cantidad, setCantidad] = useState('');
    const [precio, setPrecio] = useState('');

    const debouncedQuery = useDebounceValue(searchQuery, 400);
    const repository = new MedicationItemRepository();

    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setSearchResults([]);
            return;
        }
        const doSearch = async () => {
            setIsSearching(true);
            try {
                const data = await repository.search(debouncedQuery);
                setSearchResults(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        };
        doSearch();
    }, [debouncedQuery]);

    const handleSelectMedication = (med: MedicationItem) => {
        setSelectedMed(med);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleClearSelection = () => {
        setSelectedMed(null);
        setSearchQuery('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMed || !cantidad || !precio) return;

        onAdd({
            CodigoMedicamento: selectedMed.code,
            Cantidad: parseInt(cantidad, 10),
            Precio: parseFloat(precio),
            Nombre: selectedMed.name,
        });

        setSelectedMed(null);
        setCantidad('');
        setPrecio('');
        setSearchQuery('');
    };

    const isValid = !!(selectedMed && cantidad && precio);

    return (
        <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-slate-50 to-white overflow-visible">
            <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-200 to-gray-100 text-gray-700 border-b border-gray-200">
                <Pill size={18} />
                <h3 className="text-sm font-semibold tracking-wide">Agregar Medicamento</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Medication Search */}
                <div className="relative">
                    {selectedMed ? (
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{selectedMed.name}</p>
                                <p className="text-xs text-gray-500">Código: {selectedMed.code}</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleClearSelection}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Input
                                label="Buscar Medicamento"
                                placeholder="Ingrese código o nombre del medicamento..."
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                icon={isSearching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                            />
                            {searchResults.length > 0 && (
                                <div className="absolute z-50 left-0 right-0 mt-1 border rounded-lg overflow-hidden max-h-48 overflow-y-auto shadow-lg bg-white">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {searchResults.map((med) => (
                                                <tr
                                                    key={med.code}
                                                    onClick={() => handleSelectMedication(med)}
                                                    className="cursor-pointer hover:bg-blue-50 transition-colors"
                                                >
                                                    <td className="px-4 py-2 text-sm font-mono font-medium text-gray-800">{med.code}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-600">{med.name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Quantity, Price, and Add Button */}
                {selectedMed && (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                        <div className="sm:col-span-4">
                            <Input
                                label="Cantidad"
                                type="number"
                                value={cantidad}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCantidad(e.target.value)}
                                required
                                min={1}
                                placeholder="1"
                            />
                        </div>
                        <div className="sm:col-span-5">
                            <Input
                                label="Precio Unitario"
                                type="number"
                                step="0.01"
                                value={precio}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrecio(e.target.value)}
                                required
                                min={0.01}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                disabled={!isValid}
                            >
                                <Plus size={16} className="mr-1" />
                                Agregar
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};
