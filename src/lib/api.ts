// In production the frontend is served by the same Express server, so use a relative path.
// In dev Vite runs on a different port, so point to the Express dev server.
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

export const fetchData = async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
};

export const postData = async (endpoint: string, data: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
};

export const putData = async (endpoint: string, data: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
};

export const deleteData = async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
};

export const uploadFile = async (endpoint: string, formData: FormData) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        body: formData
    });
    if (!res.ok) throw new Error(`Upload Error: ${res.statusText}`);
    return res.json();
};

export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    // In production, static files are served from the same origin
    if (import.meta.env.PROD) return path;
    // In dev, static files are served by Express on port 5000
    return `http://localhost:5000${path}`;
};
