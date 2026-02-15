import type { VercelRequest, VercelResponse } from '@vercel/node';

// Ensure this matches the .env variable name
const TARGET_BASE_URL = process.env.VITE_SENASA_BASE_URL || 'http://186.148.93.132/';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Extract path and separate other query params
    // 'path' is injected by the rewrite rule in vercel.json
    const { path, ...restQueryParams } = req.query;

    // 2. Parsed path
    const pathStr = Array.isArray(path) ? path.join('/') : (path as string || '');

    // 3. Construct Query String
    const queryParams = new URLSearchParams(restQueryParams as any).toString();
    const queryString = queryParams ? `?${queryParams}` : '';

    // 4. Construct Target URL
    const cleanBaseUrl = TARGET_BASE_URL.replace(/\/$/, '');
    const targetUrl = `${cleanBaseUrl}/MedicamentosUnipago/${pathStr}${queryString}`;

    console.log(`[Proxy] Start: ${req.method} ${targetUrl}`);
    console.log(`[Proxy] req.url: ${req.url}`);
    console.log(`[Proxy] req.query: ${JSON.stringify(req.query)}`);
    console.log(`[Proxy] Body type: ${typeof req.body}`);

    try {
        const contentType = req.headers['content-type'] || 'application/json';

        // Prepare headers: Filter out problematic headers
        const forwardedHeaders: Record<string, string> = {
            'Content-Type': contentType, // Preserve client content type logic
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', // Fake UA to satisfy strict IIS
        };

        // Forward Authorization if present
        if (req.headers.authorization) {
            forwardedHeaders['Authorization'] = req.headers.authorization;
        }

        let body: any;

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
        console.log(`[Proxy] Upstream response: ${response.status}`);

        // Forward response headers
        res.setHeader('Content-Type', response.headers.get('Content-Type') || 'application/json');

        // DEBUG: Add target URL to header so we can see what was requested
        res.setHeader('X-Debug-Target-Url', targetUrl);
        res.setHeader('X-Debug-Path', pathStr || '(empty)');

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
