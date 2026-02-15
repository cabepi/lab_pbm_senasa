import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../lib/db';

const SENASA_BASE_URL = process.env.VITE_SENASA_BASE_URL;
const SENASA_USERNAME = process.env.VITE_SENASA_USERNAME;
const SENASA_PASSWORD = process.env.VITE_SENASA_PASSWORD;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code } = req.query;
    const { motivo, voider_email, pharmacy_code } = req.body;

    if (!motivo || !voider_email || !pharmacy_code) {
        return res.status(400).json({ error: 'Motivo, voider_email, and pharmacy_code are required' });
    }

    try {
        const db = getDb();

        // 1. Verify authorization exists
        const authResult = await db.query(
            `SELECT * FROM lab_pbm_senasa.authorizations WHERE authorization_code = $1`,
            [code]
        );

        if (authResult.rows.length === 0) {
            return res.status(404).json({ error: 'Authorization not found' });
        }

        const authRecord = authResult.rows[0];

        if (authRecord.status === 'VOIDED') {
            return res.status(400).json({ error: 'Authorization is already voided' });
        }

        // 2. Authenticate with Unipago
        const authResponse = await fetch(`${SENASA_BASE_URL}MedicamentosUnipago/api/Autorizacion/Autenticar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Usuario: SENASA_USERNAME, Clave: SENASA_PASSWORD }),
        });

        const authData = await authResponse.json() as any;
        const token = authData.Token || authData.token;

        if (!token) {
            return res.status(502).json({ error: 'Failed to authenticate with Unipago' });
        }

        // 3. Call Unipago Anular API
        const anularResponse = await fetch(`${SENASA_BASE_URL}MedicamentosUnipago/api/Autorizacion/Anular`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                CodigoAutorizacion: Number(code),
                CodigoFarmacia: Number(pharmacy_code),
                Motivo: motivo,
            }),
        });

        const anularResult = await anularResponse.text();
        let anularJson: any;
        try {
            anularJson = JSON.parse(anularResult);
        } catch {
            anularJson = { raw: anularResult };
        }

        // Check for the exact success message
        const SUCCESS_MSG = 'La Autorización fue anulada exitosamente';
        if (anularJson?.MSG !== SUCCESS_MSG) {
            const errorMsg = anularJson?.MSG || anularJson?.raw || 'Respuesta inesperada del servicio';
            console.error('Unipago Anular failed:', anularResponse.status, anularResult);
            return res.status(502).json({ error: errorMsg });
        }

        // 4. Update authorization record
        const voidedAt = new Date();
        await db.query(
            `UPDATE lab_pbm_senasa.authorizations
             SET status = 'VOIDED', voider_email = $1, voided_at = $2, void_reason = $3
             WHERE authorization_code = $4`,
            [voider_email, voidedAt, motivo, code]
        );

        // 5. Insert trace record (non-blocking)
        try {
            await db.query(
                `INSERT INTO lab_pbm_senasa.authorization_traces (
                    created_at, transaction_id, user_email, user_ip,
                    action_type, response_code, pharmacy_code, authorization_code,
                    affiliate_document, payload_input, payload_output
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    voidedAt,
                    authRecord.transaction_id,
                    voider_email,
                    req.headers['x-forwarded-for'] || null,
                    'VOID',
                    anularResponse.status,
                    pharmacy_code,
                    code,
                    authRecord.affiliate_document,
                    JSON.stringify({ CodigoAutorizacion: Number(code), CodigoFarmacia: Number(pharmacy_code), Motivo: motivo }),
                    JSON.stringify(anularJson),
                ]
            );
        } catch (traceError) {
            console.error('Error inserting void trace (non-blocking):', traceError);
        }

        res.json({ message: 'Authorization voided successfully', result: anularJson });
    } catch (error) {
        console.error('Error voiding authorization:', error);
        res.status(500).json({ error: 'Failed to void authorization' });
    }
}
