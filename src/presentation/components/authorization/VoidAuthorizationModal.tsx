import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface VoidAuthorizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    authorizationCode: string;
    pharmacyCode: string;
    voiderEmail: string;
    onVoidSuccess: () => void;
}

export const VoidAuthorizationModal: React.FC<VoidAuthorizationModalProps> = ({
    isOpen,
    onClose,
    authorizationCode,
    pharmacyCode,
    voiderEmail,
    onVoidSuccess,
}) => {
    const [motivo, setMotivo] = useState('');
    const [isVoiding, setIsVoiding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVoid = async () => {
        if (!motivo.trim()) {
            setError('Debe indicar el motivo de la anulación.');
            return;
        }

        setIsVoiding(true);
        setError(null);

        try {
            const response = await fetch(`/api/authorizations/${authorizationCode}/void`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    motivo: motivo.trim(),
                    voider_email: voiderEmail,
                    pharmacy_code: pharmacyCode,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al anular la autorización');
            }

            onVoidSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.message || 'Error desconocido al anular.');
        } finally {
            setIsVoiding(false);
        }
    };

    const handleClose = () => {
        setMotivo('');
        setError(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gray-900">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Anular Autorización
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <span className="text-xs text-gray-500 uppercase block mb-1">Código de Autorización</span>
                            <span className="text-lg font-mono font-semibold text-gray-900">{authorizationCode}</span>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <span className="text-xs text-gray-500 uppercase block mb-1">Código de Farmacia</span>
                            <span className="text-lg font-mono font-semibold text-gray-900">{pharmacyCode}</span>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
                            Motivo de Anulación <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="motivo"
                            rows={3}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-senasa-primary focus:border-senasa-primary placeholder-gray-400 resize-none"
                            placeholder="Describa el motivo de la anulación..."
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            disabled={isVoiding}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="secondary" onClick={handleClose} disabled={isVoiding}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleVoid}
                        isLoading={isVoiding}
                        disabled={!motivo.trim()}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Anular Autorización
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
