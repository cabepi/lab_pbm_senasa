import type { VercelRequest, VercelResponse } from '@vercel/node';

// Ensure this matches the .env variable name
const TARGET_BASE_URL = process.env.VITE_SENASA_BASE_URL || 'http://186.148.93.132/';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { path } = req.query; // path is an array from [...path]
    const pathStr = Array.isArray(path) ? path.join('/') : path;
    const targetUrl = `${TARGET_BASE_URL}MedicamentosUnipago/${pathStr}`;

    console.log(`[Proxy] Forwarding ${req.method} to ${targetUrl}`);

    try {
        // Forward the request using native fetch (Node 18+)
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                ...req.headers as any,
                host: new URL(targetUrl).host, // Override host header
                origin: new URL(targetUrl).origin // Emulate same-origin
            },
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
        });

        // Forward headers back to client
        response.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });

        const data = await response.text();

        // Try to parse as JSON if compatible
        try {
            const json = JSON.parse(data);
            res.status(response.status).json(json);
        } catch {
            res.status(response.status).send(data);
        }

    } catch (error: any) {
        console.error('[Proxy Error]', error.message);
        res.status(500).json({ error: 'Proxy failed', details: error.message });
    }
}
