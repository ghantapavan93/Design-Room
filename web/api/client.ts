export class ApiClient {
    private apiUrl: string;

    constructor() {
        if (typeof window !== 'undefined') {
            const protocol = window.location.protocol;
            const port = window.location.port === '3001' ? '3000' : window.location.port;
            const host = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
            this.apiUrl = `${protocol}//${host}:${port}`;
        } else {
            // SSR fallback
            this.apiUrl = 'http://127.0.0.1:3000';
        }
    }

    async graphqlRequest<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
        const res = await fetch(`${this.apiUrl}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ query, variables })
        });

        if (!res.ok) {
            throw new Error(`Network error: ${res.statusText}`);
        }

        const json = await res.json();
        if (json.errors && json.errors.length > 0) {
            throw new Error(json.errors[0].message);
        }

        return json.data;
    }
}

export const api = new ApiClient();
