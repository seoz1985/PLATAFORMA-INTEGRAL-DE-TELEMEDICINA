// API Helper
const API_URL = window.location.origin + '/api';

class API {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        
        const config = {
            ...options,
            headers: this.getHeaders()
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la solicitud');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    async login(username, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (data.token) {
            this.setToken(data.token);
        }
        
        return data;
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } finally {
            this.removeToken();
        }
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    // Dashboard
    async getEstadisticas() {
        return this.request('/dashboard/estadisticas');
    }

    async getModulos() {
        return this.request('/dashboard/modulos');
    }

    async getActividad(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/dashboard/actividad?${query}`);
    }

    // Usuarios
    async getUsuarios(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/usuarios?${query}`);
    }

    async createUsuario(data) {
        return this.request('/usuarios', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateUsuario(id, data) {
        return this.request(`/usuarios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteUsuario(id) {
        return this.request(`/usuarios/${id}`, {
            method: 'DELETE'
        });
    }
}

const api = new API();
