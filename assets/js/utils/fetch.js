/**
 * Enhanced fetch utility to handle cross-domain requests to the Python API service
 */
export async function apiFetch(endpoint, options = {}) {
    const baseUrl = getPythonServiceUrl();
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'same-origin'
    };
    
    const fetchOptions = {...defaultOptions, ...options};
    
    try {
        console.log(`Fetching ${url}...`);
        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error (${response.status}): ${errorText}`);
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return response;
    } catch (error) {
        console.error('API fetch error:', error);
        throw error;
    }
}

/**
 * Get the Python API service URL based on the current environment
 */
function getPythonServiceUrl() {
    // Check if we're running on render.com
    if (window.location.hostname.includes('render.com') || 
        window.location.hostname.includes('onrender.com')) {
        
        // Use environment variable if available
        if (window.process && window.process.env && window.process.env.PYTHON_SERVICE_URL) {
            return window.process.env.PYTHON_SERVICE_URL;
        }
        
        // Default API path for render using the actual domain
        const hostname = window.location.hostname;
        if (hostname === 'docexp.onrender.com') {
            return 'https://docexp-api.onrender.com';
        }
        
        // Generic replacement (fallback)
        return window.location.origin.replace('docexp', 'docexp-api');
    }
    
    // Default to localhost for development
    return 'http://localhost:5000';
}
