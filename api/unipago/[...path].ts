import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Ensure this matches the .env variable name
const TARGET_BASE_URL = process.env.VITE_SENASA_BASE_URL || 'http://186.148.93.132/';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { path } = req.query; // path is an array from [...path]
    const pathStr = Array.isArray(path) ? path.join('/') : path;
    const targetUrl = `${TARGET_BASE_URL}MedicamentosUnipago/${pathStr}`;

    console.log(`[Proxy] Forwarding ${req.method} to ${targetUrl}`);

    try {
        // Forward the request
        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: {
                ...req.headers,
                host: new URL(targetUrl).host, // Override host header
                origin: new URL(targetUrl).origin // Emulate same-origin
            },
            data: req.body,
            validateStatus: () => true // Handle errors manually
        });

        // Forward headers back to client
        Object.entries(response.headers).forEach(([key, value]) => {
            res.setHeader(key, value as string | string[]);
        });

        res.status(response.status).send(response.data);

    } catch (error: any) {
        console.error('[Proxy Error]', error.message);
        res.status(500).json({ error: 'Proxy failed', details: error.message });
    }
}
