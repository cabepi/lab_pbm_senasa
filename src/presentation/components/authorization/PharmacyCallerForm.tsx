import React, { useState } from 'react';
import { User, Phone, CreditCard, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface CallerInfo {
    name: string;
    documentId: string;
    phone: string;
}

interface PharmacyCallerFormProps {
    onComplete: (info: CallerInfo) => void;
    onReset: () => void;
    initialData?: CallerInfo | null;
    stepLabel?: string;
}

export const PharmacyCallerForm: React.FC<PharmacyCallerFormProps> = ({ onComplete, onReset, initialData, stepLabel = "Paso 1" }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [documentId, setDocumentId] = useState(initialData?.documentId || '');
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [isConfirmed, setIsConfirmed] = useState(false);

    const isValid = name.trim().length > 3 && documentId.trim().length > 5 && phone.trim().length > 6;

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValid) {
            setIsConfirmed(true);
            onComplete({ name, documentId, phone });
        }
    };

    const handleEdit = () => {
        setIsConfirmed(false);
        onReset();
    };

    if (isConfirmed) {
        return (
            <Card className="p-4 bg-green-50 border-green-200 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-green-800 uppercase tracking-wide">Solicitante Validado</h3>
                        <p className="text-sm text-green-700 font-medium">{name} <span className="text-green-600/70 text-xs">({documentId})</span></p>
                    </div>
                </div>
                <Button variant="secondary" size="sm" onClick={handleEdit} className="text-green-700 border-green-300 hover:bg-green-100 h-8">
                    Editar
                </Button>
            </Card>
        );
    }

    return (
        <Card className="p-6 border-t-4 border-t-gray-500 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-0.5 rounded-full">{stepLabel}</span>
                Datos del Solicitante (Farmacia)
            </h3>

            <form onSubmit={handleConfirm} className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-[1.5] w-full lg:w-auto">
                    <Input
                        label="Nombre Completo"
                        placeholder="Quien realiza la llamada..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        icon={<User size={18} />}
                        className="bg-white py-1"
                        required
                    />
                </div>
                <div className="flex-[1.2] w-full lg:w-auto">
                    <Input
                        label="Documento"
                        placeholder="Cédula/Código"
                        value={documentId}
                        onChange={(e) => setDocumentId(e.target.value)}
                        icon={<CreditCard size={18} />}
                        className="bg-white py-1"
                        required
                    />
                </div>
                <div className="flex-[1.2] w-full lg:w-auto">
                    <Input
                        label="Teléfono"
                        placeholder="809-555-5555"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        icon={<Phone size={18} />}
                        type="tel"
                        className="bg-white py-1"
                        required
                    />
                </div>

                <Button
                    type="submit"
                    size="sm"
                    disabled={!isValid}
                    className="transition-all h-[34px] min-w-[100px]"
                >
                    Confirmar
                </Button>
            </form>
        </Card>
    );
};
