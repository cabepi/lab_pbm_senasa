import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus } from 'lucide-react';
import type { Medication } from '../../../domain/models/Authorization';

interface MedicationFormProps {
    onAdd: (medication: Medication) => void;
}

export const MedicationForm: React.FC<MedicationFormProps> = ({ onAdd }) => {
    const [codigo, setCodigo] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [precio, setPrecio] = useState('');
    const [nombre, setNombre] = useState(''); // Optional, for display

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!codigo || !cantidad || !precio) return;

        onAdd({
            CodigoMedicamento: codigo,
            Cantidad: parseInt(cantidad, 10),
            Precio: parseFloat(precio),
            Nombre: nombre
        });

        // Reset form
        setCodigo('');
        setCantidad('');
        setPrecio('');
        setNombre('');
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="md:col-span-2">
                <Input
                    label="Código Medicamento"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                    placeholder="Ej. 14190"
                />
            </div>
            <div className="md:col-span-1">
                <Input
                    label="Cantidad"
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    required
                    min={1}
                />
            </div>
            <div className="md:col-span-1">
                <Input
                    label="Precio Unitario"
                    type="number"
                    step="0.01"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    required
                    min={0.01}
                />
            </div>
            <div className="md:col-span-1">
                <Button type="submit" variant="secondary" className="w-full">
                    <Plus size={16} className="mr-2" />
                    Agregar
                </Button>
            </div>
        </form>
    );
};
