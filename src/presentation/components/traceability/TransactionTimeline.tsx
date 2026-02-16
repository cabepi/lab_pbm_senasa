import React, { useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    ChevronDown,
    ChevronUp,
    Activity,
    FileJson
} from 'lucide-react';

interface TraceEvent {
    id: string;
    created_at: string;
    transaction_id: string;
    action_type: 'VALIDATION' | 'AUTHORIZATION' | 'VOID' | string;
    response_code: number;
    duration_ms: number;
    user_email: string;
    pharmacy_code: string;
    payload_input: unknown;
    payload_output: unknown;
    authorization_code?: string;
}

interface TransactionTimelineProps {
    transactionId: string;
    events: TraceEvent[];
}

export const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ transactionId, events }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedPayload, setSelectedPayload] = useState<{ type: 'input' | 'output'; content: unknown } | null>(null);

    // Sort events by time
    const sortedEvents = [...events].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const firstEvent = sortedEvents[0];

    const isVoided = events.some(e => e.action_type === 'VOID');
    const status = isVoided ? 'VOIDED' : 'ACTIVE'; // VOIDED -> Red, ACTIVE -> Green

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-DO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 transition-all hover:shadow-md">
            {/* Header / Summary */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer bg-gray-50/50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {status === 'ACTIVE' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm flex flex-col">
                            <span>Autorización: <span className="font-mono text-gray-700">{firstEvent.authorization_code || 'N/A'}</span></span>
                            <span className="text-xs font-normal text-gray-500">Transacción: <span className="font-mono">{transactionId}</span></span>
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                                <Clock size={12} /> {formatDate(firstEvent.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Activity size={12} /> {events.length} eventos
                            </span>
                            <span>
                                Usuario: {firstEvent.user_email}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-gray-400">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {/* Timeline Details */}
            {isExpanded && (
                <div className="p-6 border-t border-gray-100 bg-white">
                    <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
                        {sortedEvents.map((event) => (
                            <div key={event.id} className="relative">
                                {/* Timeline Dot */}
                                <div className={`absolute -left-[25px] top-1 w-4 h-4 rounded-full border-2 border-white ${event.action_type === 'VOID'
                                    ? 'bg-red-500' // Red for Void
                                    : 'bg-green-500' // Green for Validation/Authorization
                                    }`} />

                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-800">{event.action_type}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${event.response_code >= 200 && event.response_code < 300
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                HTTP {event.response_code}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                                            <span>{formatDate(event.created_at)}</span>
                                            <span>•</span>
                                            <span>{event.duration_ms}ms</span>
                                            <span>•</span>
                                            <span className="font-medium text-gray-700">{event.user_email}</span>
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedPayload({ type: 'input', content: event.payload_input }); }}
                                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                        >
                                            <FileJson size={14} /> Input
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedPayload({ type: 'output', content: event.payload_output }); }}
                                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors"
                                        >
                                            <FileJson size={14} /> Output
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* JSON Modal/Inspector */}
            {selectedPayload && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPayload(null)}>
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h3 className="font-bold text-gray-700">payload_{selectedPayload.type}</h3>
                            <button onClick={() => setSelectedPayload(null)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-4 overflow-auto font-mono text-xs bg-gray-900 text-green-400">
                            <pre>{JSON.stringify(selectedPayload.content, null, 2)}</pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
