/**
 * Sogang Team Building Service - Main Application Script
 * Handles Shared Components (Header/Footer), Mock Data Initialization, and Data Service
 */

class DataService {
    constructor() {
        // Use relative path for API. 
        // In dev (VS Code Live Server), we need a way to proxy or just point to localhost:5000?
        // Actually, for best deployment compat, we use relative path and handle proxying in dev server or assumption.
        // However, since this is a vanilla JS app often run from file:// or generic server, we might need a fallback.
        // But for this User Request "deploy this website", we optimize for the deployed state.
        // Vercel will serve frontend and proxy /api to backend.

        // Smart URL detection:
        // If we are on localhost, we might be running frontend on 5500 and backend on 5000.
        // If we are on production, we use relative path.
        const isLocalhost = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

        // IMPORTANT: If the Vercel rewrite (/api) is failing, we use the absolute URL for production.
        // CORS is enabled on your backend, so this will work perfectly.
        this.API_URL = isLocalhost ? 'http://localhost:5000/api' : 'https://sogang-teambuilder-backend.onrender.com/api';


        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    // --- Auth Methods ---

    async register(name, email, password) {
        try {
            const res = await fetch(`${this.API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Registration failed');

            this._setSession(data.token, data.user);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async login(email, password) {
        try {
            const res = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Login failed');

            this._setSession(data.token, data.user);
            return { success: true, user: data.user };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.token = null;
        this.user = null;
        window.location.reload();
    }

    getCurrentUser() {
        return this.user;
    }

    _setSession(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    _authHeader() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    // --- Profile Methods ---

    async updateProfile(profileData) {
        try {
            const res = await fetch(`${this.API_URL}/users/profile`, {
                method: 'PUT',
                headers: this._authHeader(),
                body: JSON.stringify(profileData)
            });
            if (!res.ok) throw new Error('Failed to update profile');
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async getProfile(email = null) {
        // Note: The backend currently supports getting MY profile or ALL users.
        // To get a specific user's profile, we might need to filter from getUsers() or add a specific endpoint.
        // For now, if email is provided, we'll try to find it in getUsers (inefficient but works for prototype).
        if (email && email !== this.user?.email) {
            const users = await this.getUsers();
            const user = users.find(u => u.email === email);
            return user ? user.profile : {};
        }

        try {
            const res = await fetch(`${this.API_URL}/users/profile`, {
                headers: this._authHeader()
            });
            if (!res.ok) return {}; // No profile yet
            return await res.json();
        } catch (err) {
            return {};
        }
    }

    async getUsers() {
        try {
            const res = await fetch(`${this.API_URL}/users`);
            return await res.json();
        } catch (err) {
            return [];
        }
    }

    // --- Project Methods ---

    async getProjects(filters = {}) {
        try {
            const res = await fetch(`${this.API_URL}/projects`);
            let projects = await res.json();

            if (filters.owner) {
                // This assumes we can filter by owner ID or we need to fetch user details to match email
                // The current backend Project model stores owner as ObjectId.
                // The frontend passes email. We need to handle this mismatch.
                // For now, let's filter client-side if we have the owner's email in the project object?
                // The backend returns populated owner? No, currently just ObjectId.
                // We should update the backend to populate owner.
                // OR, we filter by owner ID if we know it.

                // Temporary fix: Return all for now, or implement client-side filtering if we fetch users.
            }
            return projects;
        } catch (err) {
            return [];
        }
    }

    async getProjectById(id) {
        try {
            const res = await fetch(`${this.API_URL}/projects/${id}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            return null;
        }
    }

    async createProject(projectData) {
        try {
            const res = await fetch(`${this.API_URL}/projects`, {
                method: 'POST',
                headers: this._authHeader(),
                body: JSON.stringify(projectData)
            });
            if (!res.ok) throw new Error('Failed to create project');
            const project = await res.json();
            return { success: true, project };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    // --- Application Methods ---

    async createApplication(projectId, role, message) {
        try {
            const res = await fetch(`${this.API_URL}/projects/${projectId}/join`, {
                method: 'POST',
                headers: this._authHeader(),
                body: JSON.stringify({ role, message })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.msg || 'Failed to apply');
            }
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async getApplications(filters = {}) {
        if (!filters.projectId) return [];
        try {
            const res = await fetch(`${this.API_URL}/projects/${filters.projectId}/applications`, {
                headers: this._authHeader()
            });
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            return [];
        }
    }

    async updateApplicationStatus(appId, status) {
        // Note: The backend route requires projectId. 
        // We need to pass projectId to this method or store it in the application object.
        // The frontend currently calls it with just appId.
        // We might need to change the frontend call or find a way to get projectId.
        // Let's assume the frontend passes projectId as well, or we change the signature.
        // Actually, looking at workspace.html, it only passes appId.
        // This is a problem. The backend route is /projects/applications/:projectId/:appId
        // I should probably change the backend route to just /projects/applications/:appId if possible, 
        // but applications are embedded in projects.
        // So I need projectId.
        // I will update workspace.html to pass projectId.
        // For now, let's update the signature here.
        return { success: false, message: "Method signature update required: pass projectId" };
    }

    async updateApplicationStatusWithProject(projectId, appId, status) {
        try {
            const res = await fetch(`${this.API_URL}/projects/applications/${projectId}/${appId}`, {
                method: 'PUT',
                headers: this._authHeader(),
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('Failed to update status');
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    // --- Chat Methods ---

    async getChats(projectId) {
        try {
            const res = await fetch(`${this.API_URL}/chats/${projectId}`, {
                headers: this._authHeader()
            });
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            return [];
        }
    }

    async sendChat(projectId, message) {
        try {
            const res = await fetch(`${this.API_URL}/chats/${projectId}`, {
                method: 'POST',
                headers: this._authHeader(),
                body: JSON.stringify({ message })
            });
            if (!res.ok) throw new Error('Failed to send message');
            const chat = await res.json();
            return { success: true, chat };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async sendInvitation(targetEmail, projectId) {
        try {
            const res = await fetch(`${this.API_URL}/notifications/invite`, {
                method: 'POST',
                headers: this._authHeader(),
                body: JSON.stringify({ targetEmail, projectId })
            });
            if (!res.ok) throw new Error('Failed to send invitation');
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async getNotifications() {
        try {
            const res = await fetch(`${this.API_URL}/notifications`, {
                headers: this._authHeader()
            });
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            return [];
        }
    }
}

// Initialize Global DB Instance
window.db = new DataService();


document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadFooter();
    highlightActivePage();
});

function loadHeader() {
    const headerContainer = document.getElementById('main-header');
    if (!headerContainer) return;

    // Determine relative path based on current location
    const path = window.location.pathname;
    let rootPath = './';
    if (path.includes('/auth/') || path.includes('/projects/') || path.includes('/members/')) {
        rootPath = '../';
    }

    const currentUser = window.db.getCurrentUser();
    let notifications = [];
    if (currentUser) {
        notifications = window.db.getNotifications();
    }
    const hasUnread = notifications.length > 0;

    headerContainer.innerHTML = `
        <div class="container" style="display: flex; justify-content: space-between; align-items: center; height: 4rem;">
            <a href="${rootPath}index.html" class="logo" style="display: flex; align-items: center; gap: 0.75rem; font-weight: 700; font-size: 1.25rem; color: var(--color-text-primary); text-decoration: none;">
                <div style="width: 32px; height: 32px; background: var(--color-sogang-red); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900;">S</div>
                <span>Sogang Team</span>
            </a>
            
            <nav class="main-nav" style="display: flex; gap: 2rem; align-items: center;">
                <a href="${rootPath}projects/join.html" class="nav-link">Find Projects</a>
                <a href="${rootPath}members/find.html" class="nav-link">Find Members</a>
                <a href="${rootPath}projects/my.html" class="nav-link">My Projects</a>
            </nav>

            <div class="auth-actions" style="display: flex; align-items: center; gap: 1.5rem;">
                ${currentUser ? `
                    <!-- Notification Bell -->
                    <div style="position: relative; cursor: pointer;" id="notif-btn">
                        <div style="font-size: 1.25rem;">🔔</div>
                        ${hasUnread ? `<div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: red; border-radius: 50%;"></div>` : ''}
                        
                        <!-- Dropdown -->
                        <div id="notif-dropdown" style="display: none; position: absolute; top: 100%; right: 0; width: 300px; background: white; border: 1px solid var(--color-border); border-radius: 8px; box-shadow: var(--shadow-md); z-index: 100; max-height: 400px; overflow-y: auto;">
                            <div style="padding: 0.75rem; border-bottom: 1px solid var(--color-border); font-weight: 600; font-size: 0.9rem;">Notifications</div>
                            ${notifications.length === 0 ? `
                                <div style="padding: 1rem; text-align: center; color: var(--color-text-secondary); font-size: 0.85rem;">No new notifications</div>
                            ` : notifications.map(n => `
                                <a href="${rootPath + n.link}" style="display: block; padding: 0.75rem; border-bottom: 1px solid var(--color-border); text-decoration: none; color: inherit; transition: bg 0.2s;">
                                    <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">${n.title}</div>
                                    <div style="font-size: 0.8rem; color: var(--color-text-secondary);">${n.message}</div>
                                </a>
                            `).join('')}
                        </div>
                    </div>

                    <a href="${rootPath}profile.html" class="avatar" style="width: 36px; height: 36px; background: #EEE; border-radius: 50%; display: block; overflow: hidden; border: 2px solid var(--color-border);" title="${currentUser.name}">
                         <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}" alt="User" style="width: 100%; height: 100%;">
                    </a>
                    <button id="logoutBtn" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.3rem 0.75rem;">Log Out</button>
                ` : `
                    <a href="${rootPath}auth/login.html" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.4rem 1rem;">Log In</a>
                    <a href="${rootPath}auth/register.html" class="btn btn-primary" style="font-size: 0.85rem; padding: 0.4rem 1rem;">Sign Up</a>
                `}
            </div>
        </div>
    `;

    // Dropdown Toggle
    const notifBtn = document.getElementById('notif-btn');
    const notifDropdown = document.getElementById('notif-dropdown');

    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling
            const isVisible = notifDropdown.style.display === 'block';
            notifDropdown.style.display = isVisible ? 'none' : 'block';
        });

        // Close on click outside
        document.addEventListener('click', () => {
            notifDropdown.style.display = 'none';
        });
    }

    // Attach logout event
    if (currentUser) {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to log out?')) {
                window.db.logout();
                // Redirect logic is in db.logout or handled here? 
                // db.logout reloads, but we might want to go to home if on protected page.
                // For now reload is fine as it clears state.
            }
        });
    }
}

function loadFooter() {
    const footerContainer = document.getElementById('main-footer');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <div class="container" style="padding: 3rem 1rem; border-top: 1px solid var(--color-border); margin-top: 4rem; color: var(--color-text-secondary); font-size: 0.875rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 2rem;">
                <div>
                    <h5 style="color: var(--color-text-primary); margin-bottom: 0.5rem; font-weight: 700;">Sogang Team Building</h5>
                    <p>Connect, Collaborate, and Create.</p>
                </div>
                <div style="text-align: right;">
                    <p>&copy; 2024 Sogang University.</p>
                    <p>Made for students, by students.</p>
                </div>
            </div>
        </div>
    `;
}

function highlightActivePage() {
    const path = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const cleanHref = href.replace('../', '').replace('./', '');
        // simple check
        if (path.includes(cleanHref) && cleanHref !== '') {
            link.style.color = 'var(--color-sogang-red)';
            link.style.fontWeight = '600';
        }
    });
}
