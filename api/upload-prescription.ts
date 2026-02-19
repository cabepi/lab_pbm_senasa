import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

export const config = {
    api: {
        bodyParser: false, // Disable default body parsing to handle multipart
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const contentType = req.headers['content-type'] || '';

        if (!contentType.includes('multipart/form-data')) {
            return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
        }

        // Parse multipart form data manually using Web APIs
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        const body = Buffer.concat(chunks);

        // Extract boundary from content-type
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^\s;]+))/);
        if (!boundaryMatch) {
            return res.status(400).json({ error: 'Could not parse multipart boundary' });
        }
        const boundary = boundaryMatch[1] || boundaryMatch[2];

        // Parse parts
        const parts = parseMultipart(body, boundary);

        const filePart = parts.find(p => p.name === 'file');
        const authCodePart = parts.find(p => p.name === 'authorization_code');

        if (!filePart || !filePart.data || !authCodePart) {
            return res.status(400).json({ error: 'File and authorization_code are required' });
        }

        const authorizationCode = authCodePart.data.toString('utf-8');
        const filename = filePart.filename || 'prescription';
        const blobPath = `medical_prescriptions/${authorizationCode}/${filename}`;

        console.log(`[Upload] Uploading file ${filename} for auth ${authorizationCode}`);

        const blob = await put(blobPath, filePart.data, {
            access: 'public',
        });

        console.log(`[Upload] Success: ${blob.url}`);
        return res.json({ url: blob.url });
    } catch (error: any) {
        console.error('[Upload Error]', error);
        return res.status(500).json({ error: 'Failed to upload file', details: error.message });
    }
}

interface Part {
    name?: string;
    filename?: string;
    data: Buffer;
    contentType?: string;
}

function parseMultipart(body: Buffer, boundary: string): Part[] {
    const parts: Part[] = [];
    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const endBoundary = Buffer.from(`--${boundary}--`);

    let start = body.indexOf(boundaryBuffer) + boundaryBuffer.length;

    while (start < body.length) {
        // Find end of this part
        let end = body.indexOf(boundaryBuffer, start);
        if (end === -1) break;

        const partData = body.subarray(start, end);

        // Split headers and body (separated by \r\n\r\n)
        const headerEndIndex = partData.indexOf('\r\n\r\n');
        if (headerEndIndex === -1) {
            start = end + boundaryBuffer.length;
            continue;
        }

        const headerSection = partData.subarray(0, headerEndIndex).toString('utf-8');
        // Remove trailing \r\n from body data
        let bodyData = partData.subarray(headerEndIndex + 4);
        if (bodyData.length >= 2 && bodyData[bodyData.length - 2] === 0x0d && bodyData[bodyData.length - 1] === 0x0a) {
            bodyData = bodyData.subarray(0, bodyData.length - 2);
        }

        // Parse headers
        const nameMatch = headerSection.match(/name="([^"]+)"/);
        const filenameMatch = headerSection.match(/filename="([^"]+)"/);
        const contentTypeMatch = headerSection.match(/Content-Type:\s*(.+)/i);

        // Skip leading \r\n
        const cleanedStart = partData[0] === 0x0d && partData[1] === 0x0a ? 2 : 0;

        parts.push({
            name: nameMatch?.[1],
            filename: filenameMatch?.[1],
            data: bodyData,
            contentType: contentTypeMatch?.[1]?.trim(),
        });

        // Check if next boundary is the end
        if (body.subarray(end, end + endBoundary.length).equals(endBoundary)) {
            break;
        }

        start = end + boundaryBuffer.length;
    }

    return parts;
}
