import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MedicationForm } from './MedicationForm';
import type { Medication } from '../../../domain/models/Authorization';
import { Trash2, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthorizationPanelProps {
    onValidate: (medications: Medication[]) => void;
    isLoading: boolean;
    error: string | null;
    response: any | null;
}

export const AuthorizationPanel: React.FC<AuthorizationPanelProps> = ({
    onValidate,
    isLoading,
    error,
    response
}) => {
    const [medications, setMedications] = useState<Medication[]>([]);

    const handleAddMedication = (med: Medication) => {
        setMedications([...medications, med]);
    };

    const handleRemoveMedication = (index: number) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    return (
        <Card title="Validación de Autorización" className="border-t-4 border-t-blue-500 shadow-md">
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Agregar Medicamentos</h3>
                    <MedicationForm onAdd={handleAddMedication} />
                </div>

                {medications.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Lista de Medicamentos ({medications.length})</h3>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {medications.map((med, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.CodigoMedicamento}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.Cantidad}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${med.Precio.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(med.Cantidad * med.Precio).toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleRemoveMedication(index)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button
                        onClick={() => onValidate(medications)}
                        isLoading={isLoading}
                        disabled={medications.length === 0}
                    >
                        Validar Autorización
                    </Button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {response && (
                    <div className={`p-4 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border ${response.ErrorNumber === 1000 ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        {response.ErrorNumber === 1000 ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <div>
                            <p className="font-medium">{response.ErrorNumber === 1000 ? 'Autorización Exitosa' : 'Error en Autorización'}</p>
                            <p className="text-sm">{response.ErrorMessage}</p>
                            {response.NumeroAutorizacion && <p className="text-sm mt-1 font-mono">No. {response.NumeroAutorizacion}</p>}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
