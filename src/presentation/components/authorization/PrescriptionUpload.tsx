import React, { useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, FileType, Check, Calendar, User, Stethoscope } from 'lucide-react';
import { Button } from '../ui/Button';

interface PrescriptionUploadProps {
    medico: string;
    setMedico: (value: string) => void;
    fecha: string;
    setFecha: (value: string) => void;
    diagnostico: string;
    setDiagnostico: (value: string) => void;
    usoContinuo: boolean;
    setUsoContinuo: (value: boolean) => void;
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    // PyP Props
    programs?: { CodigoPrograma: number; Programa: string; CodigoCirculo: number; Circulo: string; }[];
    prescriptionType: 'NORMAL' | 'PYP' | 'EMERGENCY';
    setPrescriptionType: (value: 'NORMAL' | 'PYP' | 'EMERGENCY') => void;
    selectedPypProgram: number | null;
    setSelectedPypProgram: (value: number | null) => void;
}

export const PrescriptionUpload: React.FC<PrescriptionUploadProps> = ({
    medico,
    setMedico,
    fecha,
    setFecha,
    diagnostico,
    setDiagnostico,
    usoContinuo,
    setUsoContinuo,
    selectedFile,
    setSelectedFile,
    programs = [],
    prescriptionType,
    setPrescriptionType,
    selectedPypProgram,
    setSelectedPypProgram
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg'
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const validateAndSetFile = (file: File) => {
        if (allowedTypes.includes(file.type)) {
            setSelectedFile(file);
        } else {
            alert('Formato de archivo no permitido. Use PDF, Word o Imágenes.');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return <FileType size={24} className="text-red-500" />;
        if (type.includes('word') || type.includes('document')) return <FileText size={24} className="text-blue-500" />;
        if (type.includes('image')) return <ImageIcon size={24} className="text-purple-500" />;
        return <FileText size={24} className="text-gray-500" />;
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="md:flex">
                {/* Left Side: Metadata Form */}
                <div className="p-6 md:w-1/2 space-y-5 border-b md:border-b-0 md:border-r border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <Stethoscope size={16} className="text-blue-500" />
                            Datos de la Receta
                        </h4>
                        <div className="flex gap-2 items-center">
                            <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase">
                                Obligatorio *
                            </span>
                        </div>
                    </div>

                    {/* Doctor Selection */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Médico Prescriptor <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={medico}
                                onChange={(e) => setMedico(e.target.value)}
                                placeholder="Buscar médico prescriptor..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:italic placeholder:text-gray-400 hover:border-blue-300"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                <User size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Date and Diagnosis Row */}
                    <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Fecha Receta <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <input
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all hover:border-blue-300"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                                    <Calendar size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Diagnóstico <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={diagnostico}
                                    onChange={(e) => setDiagnostico(e.target.value)}
                                    placeholder="Ingrese el diagnóstico..."
                                    className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400 hover:border-blue-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Continuous Use Toggle */}
                    <div
                        className={`flex items-center gap-3 p-3 rounded-lg border border-dashed transition-all cursor-pointer select-none group ${usoContinuo
                            ? 'bg-orange-50 border-orange-300'
                            : 'bg-white border-gray-200 hover:border-orange-200 hover:bg-orange-50/30'
                            }`}
                        onClick={() => setUsoContinuo(!usoContinuo)}
                    >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${usoContinuo ? 'bg-orange-400 border-orange-500 text-white scale-110' : 'bg-white border-gray-300 group-hover:border-orange-300'
                            }`}>
                            {usoContinuo && <Check size={12} strokeWidth={4} />}
                        </div>
                        <div>
                            <p className={`text-sm font-semibold transition-colors ${usoContinuo ? 'text-orange-800' : 'text-gray-600 group-hover:text-orange-700'}`}>
                                Uso Continuo
                            </p>
                            <p className="text-[10px] text-orange-600/70 font-medium">
                                (Máximo de 3 meses)
                            </p>
                        </div>
                    </div>
                    {/* Prescription Type and PyP */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
                            Tipo de Receta <span className="text-red-500">*</span>
                        </label>

                        <div className="grid grid-cols-1 gap-3">
                            {/* Normal */}
                            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${prescriptionType === 'NORMAL'
                                ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${prescriptionType === 'NORMAL' ? 'border-blue-500' : 'border-gray-300'
                                    }`}>
                                    {prescriptionType === 'NORMAL' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                </div>
                                <input
                                    type="radio"
                                    name="prescriptionType"
                                    value="NORMAL"
                                    checked={prescriptionType === 'NORMAL'}
                                    onChange={() => setPrescriptionType('NORMAL')}
                                    className="hidden"
                                />
                                <span className={`text-sm font-medium ${prescriptionType === 'NORMAL' ? 'text-blue-900' : 'text-gray-700'}`}>
                                    Normal
                                </span>
                            </label>

                            {/* PyP Program */}
                            <label className={`flex flex-col gap-3 p-3 rounded-lg border cursor-pointer transition-all ${!programs?.length
                                ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                                : prescriptionType === 'PYP'
                                    ? 'bg-green-50 border-green-300 ring-1 ring-green-300'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!programs?.length
                                        ? 'border-gray-200 bg-gray-100'
                                        : prescriptionType === 'PYP' ? 'border-green-500' : 'border-gray-300'
                                        }`}>
                                        {prescriptionType === 'PYP' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="prescriptionType"
                                        value="PYP"
                                        checked={prescriptionType === 'PYP'}
                                        onChange={() => programs?.length && setPrescriptionType('PYP')}
                                        disabled={!programs?.length}
                                        className="hidden"
                                    />
                                    <div className="flex-1">
                                        <span className={`text-sm font-medium ${!programs?.length ? 'text-gray-400' : prescriptionType === 'PYP' ? 'text-green-900' : 'text-gray-700'}`}>
                                            Programa PyP
                                        </span>
                                        {!programs?.length && (
                                            <span className="text-[10px] text-gray-400 ml-2">(No disponible)</span>
                                        )}
                                    </div>
                                </div>

                                {/* PyP Dropdown inside the option */}
                                {prescriptionType === 'PYP' && programs && programs.length > 0 && (
                                    <div className="pl-7 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <select
                                            value={selectedPypProgram || ''}
                                            onChange={(e) => setSelectedPypProgram(Number(e.target.value))}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full px-3 py-2 bg-white border border-green-200 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-green-100 focus:border-green-400 outline-none transition-all cursor-pointer hover:border-green-300"
                                        >
                                            {programs.map((prog) => (
                                                <option key={prog.CodigoPrograma} value={prog.CodigoPrograma}>
                                                    {prog.Programa}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </label>

                            {/* Emergency */}
                            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${prescriptionType === 'EMERGENCY'
                                ? 'bg-red-50 border-red-300 ring-1 ring-red-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${prescriptionType === 'EMERGENCY' ? 'border-red-500' : 'border-gray-300'
                                    }`}>
                                    {prescriptionType === 'EMERGENCY' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                                </div>
                                <input
                                    type="radio"
                                    name="prescriptionType"
                                    value="EMERGENCY"
                                    checked={prescriptionType === 'EMERGENCY'}
                                    onChange={() => setPrescriptionType('EMERGENCY')}
                                    className="hidden"
                                />
                                <span className={`text-sm font-medium ${prescriptionType === 'EMERGENCY' ? 'text-red-900' : 'text-gray-700'}`}>
                                    Emergencia
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Side: File Upload */}
                <div className="p-6 md:w-1/2 bg-gray-50/30 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <Upload size={16} className="text-gray-400" />
                            Archivo Adjunto
                        </h4>
                        {selectedFile && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wide border border-green-200 flex items-center gap-1">
                                <Check size={10} />
                                Listo
                            </span>
                        )}
                    </div>

                    <div
                        className={`flex-1 border-2 border-dashed rounded-xl p-6 transition-all duration-300 flex flex-col items-center justify-center relative bg-white ${selectedFile
                            ? 'border-green-300 shadow-sm'
                            : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                            }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />

                        {!selectedFile ? (
                            <div
                                className="flex flex-col items-center justify-center cursor-pointer text-center group w-full h-full min-h-[180px]"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 border border-blue-100">
                                    <Upload size={28} className="text-blue-500 group-hover:text-blue-600" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                                    Subir Documento
                                </h3>
                                <p className="text-xs text-gray-500 mt-2 px-4 leading-relaxed max-w-[200px]">
                                    Arrastre su archivo aquí o haga clic para explorar
                                </p>
                                <div className="flex gap-1.5 mt-4 opacity-60">
                                    <FileType size={14} />
                                    <ImageIcon size={14} />
                                    <FileText size={14} />
                                </div>
                            </div>
                        ) : (
                            <div className="w-full text-center relative z-10 animate-in fade-in zoom-in-95 duration-200">
                                <div className="mx-auto bg-gray-50 w-16 h-16 rounded-xl flex items-center justify-center mb-3 text-gray-500 border border-gray-200 shadow-sm">
                                    {getFileIcon(selectedFile.type)}
                                </div>
                                <p className="text-sm font-bold text-gray-800 truncate px-4 mb-1" title={selectedFile.name}>
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500 font-mono mb-4 bg-gray-100 inline-block px-2 py-0.5 rounded">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <div className="flex justify-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={removeFile}
                                        className="text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200 h-8 text-xs px-3"
                                    >
                                        Eliminar
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-8 text-xs px-3 text-gray-600 border-gray-200 hover:bg-gray-50"
                                    >
                                        Cambiar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
