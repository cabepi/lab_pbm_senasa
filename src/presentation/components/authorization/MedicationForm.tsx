import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Pill, Search, Loader2, X, AlertCircle } from 'lucide-react';
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
        if (debouncedQuery.length < 4) {
            setSearchResults([]);
            return;
        }

        let active = true; // Flag to track if the effect is still active

        const doSearch = async () => {
            setIsSearching(true);
            try {
                const data = await repository.search(debouncedQuery);
                if (active) { // Only update state if this is the most recent request
                    setSearchResults(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (active) {
                    setIsSearching(false);
                }
            }
        };

        doSearch();

        return () => {
            active = false; // Cleanup: Mark as inactive when query changes
        };
    }, [debouncedQuery]);

    const [customCode, setCustomCode] = useState('');

    const handleSelectMedication = (med: MedicationItem) => {
        setSelectedMed(med);
        setSearchQuery('');
        setSearchResults([]);
        if (med.code === '0') {
            setCustomCode('');
        }
    };

    const handleClearSelection = () => {
        setSelectedMed(null);
        setSearchQuery('');
        setCustomCode('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMed || !cantidad || !precio) return;

        // If code is '0', require custom code
        if (selectedMed.code === '0' && !customCode) return;

        const finalCode = selectedMed.code === '0' ? customCode : selectedMed.code;

        onAdd({
            CodigoMedicamento: finalCode,
            Cantidad: parseInt(cantidad, 10),
            Precio: parseFloat(precio),
            Nombre: selectedMed.name,
        });

        setSelectedMed(null);
        setCantidad('');
        setPrecio('');
        setSearchQuery('');
        setCustomCode('');
    };

    const isValid = !!(selectedMed && cantidad && precio && (selectedMed.code !== '0' || customCode));

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
                                {selectedMed.name ? (
                                    <>
                                        <p className="text-sm font-semibold text-gray-800">{selectedMed.name}</p>
                                        <p className="text-xs text-gray-500">Código: {selectedMed.code}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-bold text-gray-800 font-mono bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200 w-fit">
                                            {selectedMed.code === '0' ? 'Por Asignar' : selectedMed.code}
                                        </p>
                                        <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            Medicamento no catalogado
                                        </p>
                                    </>
                                )}
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
                            {searchResults.length > 0 ? (
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
                                            {/* Always allow manual entry if query exists and doesn't match exactly */}
                                            {searchQuery && !searchResults.some(r => r.code === searchQuery) && (
                                                <tr
                                                    onClick={() => handleSelectMedication({ code: searchQuery, name: '' })}
                                                    className="cursor-pointer hover:bg-yellow-50 transition-colors border-t border-yellow-100"
                                                >
                                                    <td className="px-4 py-2 text-sm font-mono font-medium text-yellow-700">{searchQuery}</td>
                                                    <td className="px-4 py-2 text-sm text-yellow-600 italic">
                                                        Usar como código manual (No catalogado)
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                searchQuery.length > 0 && !isSearching && (
                                    <div className="absolute z-50 left-0 right-0 mt-1 border rounded-lg overflow-hidden shadow-lg bg-white p-2">
                                        <div
                                            onClick={() => handleSelectMedication({ code: searchQuery, name: '' })}
                                            className="p-2 cursor-pointer hover:bg-yellow-50 rounded-md transition-colors flex items-center gap-2"
                                        >
                                            <div className="bg-yellow-100 p-1 rounded-full text-yellow-600">
                                                <Plus size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">Usar código: <span className="font-mono text-yellow-700">{searchQuery}</span></p>
                                                <p className="text-xs text-yellow-600 italic">Medicamento no catalogado</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>

                {/* Quantity, Price, and Add Button */}
                {selectedMed && (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                        {/* Custom Code Input for Code 0 */}
                        {selectedMed.code === '0' && (
                            <div className="sm:col-span-12">
                                <Input
                                    label="Asignar Código Numérico"
                                    placeholder="Ej: 12345"
                                    value={customCode}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const val = e.target.value.replace(/\D/g, ''); // Numeric only
                                        setCustomCode(val);
                                    }}
                                    required
                                    className="border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200"
                                />
                                <p className="text-xs text-gray-500 mt-1">Este medicamento requiere un código manual.</p>
                            </div>
                        )}

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
