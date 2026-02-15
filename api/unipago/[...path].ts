import type { VercelRequest, VercelResponse } from '@vercel/node';

// Ensure this matches the .env variable name
const TARGET_BASE_URL = process.env.VITE_SENASA_BASE_URL || 'http://186.148.93.132/';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { path } = req.query; // path is an array from [...path]
    const pathStr = Array.isArray(path) ? path.join('/') : path;
    const targetUrl = `${TARGET_BASE_URL}MedicamentosUnipago/${pathStr}`;

    console.log(`[Proxy] Start: ${req.method} ${targetUrl}`);
    console.log(`[Proxy] Body type: ${typeof req.body}`);

    try {
        const contentType = req.headers['content-type'] || 'application/json';

        // Prepare headers: Filter out problematic headers
        const forwardedHeaders: Record<string, string> = {
            'Content-Type': contentType, // Preserve client content type logic
            'Accept': 'application/json',
        };

        // Forward Authorization if present
        if (req.headers.authorization) {
            forwardedHeaders['Authorization'] = req.headers.authorization;
        }

        let body: BodyInit | undefined;

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            if (contentType.includes('application/x-www-form-urlencoded')) {
                // If body is already string, use it. If object (parsed), serialize it.
                body = typeof req.body === 'object'
                    ? new URLSearchParams(req.body as any).toString()
                    : req.body;
            } else {
                body = typeof req.body === 'string'
                    ? req.body
                    : JSON.stringify(req.body);
            }
        }

        const fetchOptions: RequestInit = {
            method: req.method,
            headers: forwardedHeaders,
            body: body,
        };

        console.log('[Proxy] Fetching upstream...');
        const response = await fetch(targetUrl, fetchOptions);
        console.log(`[Proxy] Upstream response: ${response.status} ${response.statusText}`);

        // Forward headers back to client explicitly
        res.setHeader('Content-Type', response.headers.get('Content-Type') || 'application/json');

        const text = await response.text();
        console.log(`[Proxy] Response body length: ${text.length}`);

        try {
            const json = JSON.parse(text);
            res.status(response.status).json(json);
        } catch (e) {
            console.log('[Proxy] Response is not JSON, sending text');
            res.status(response.status).send(text);
        }
        console.log('[Proxy] Done.');

    } catch (error: any) {
        console.error('[Proxy Error]', error);
        res.status(500).json({ error: 'Proxy failed', details: error.message, stack: error.stack });
    }
}
