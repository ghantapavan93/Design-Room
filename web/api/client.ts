export class ApiClient {
    private apiUrl: string;

    constructor() {
        this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
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
