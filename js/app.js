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

        // Use relative path for production (Vercel) and local Node server
        this.API_URL = '/api';

        // If running on local dev server (port 5500, 5501, 3000, 5173, etc.), point to local backend
        // We assume backend is on 5000.
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            if (window.location.port !== '5000') {
                this.API_URL = 'http://localhost:5000/api';
            }
        }


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

        // Determine root path for redirect
        const path = window.location.pathname;
        let rootPath = './';
        if (path.includes('/auth/') || path.includes('/projects/') || path.includes('/members/')) {
            rootPath = '../';
        }
        window.location.href = rootPath + 'index.html';
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
                method: 'POST',
                headers: this._authHeader(),
                body: JSON.stringify(profileData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || data.message || 'Failed to update profile');
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async getUserProfile(userId) {
        try {
            const res = await fetch(`${this.API_URL}/users/${userId}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            console.error('Get User Profile Error:', err);
            return null;
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

    async getUsers(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.college && filters.college !== 'All') params.append('college', filters.college);
            if (filters.major && filters.major !== 'All') params.append('major', filters.major);
            if (filters.primaryRole && filters.primaryRole !== 'All') params.append('primaryRole', filters.primaryRole);
            if (filters.tags) params.append('tags', filters.tags);

            const res = await fetch(`${this.API_URL}/users?${params.toString()}`);
            return await res.json();
        } catch (err) {
            return [];
        }
    }

    // --- Project Methods ---

    async getProjects(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.domain) params.append('domain', filters.domain);
            if (filters.owner) params.append('owner', filters.owner);

            const res = await fetch(`${this.API_URL}/projects?${params.toString()}`);
            if (!res.ok) return [];
            let projects = await res.json();

            // Map MongoDB _id to id for frontend compatibility
            projects = projects.map(p => ({
                id: p._id,
                ...p
            }));

            // Client-side fallback/extra filtering if needed (handle both string and object owners)
            if (filters.owner) {
                projects = projects.filter(p => {
                    const ownerId = (typeof p.owner === 'object') ? (p.owner._id || p.owner.id) : p.owner;
                    return String(ownerId) === String(filters.owner);
                });
            }
            return projects;
        } catch (err) {
            console.error('getProjects error:', err);
            return [];
        }
    }

    async getProjectById(id) {
        try {
            const res = await fetch(`${this.API_URL}/projects/${id}`);
            if (!res.ok) return null;
            const project = await res.json();
            // Map MongoDB _id to id for frontend compatibility
            return { id: project._id, ...project };
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
            if (!res.ok) {
                const data = await res.json().catch(() => ({})); // Handle non-JSON errors
                throw new Error(data.msg || data.message || `Failed to create project (${res.status})`);
            }
            const project = await res.json();
            return { success: true, project };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async getJoinedProjects() {
        try {
            const projects = await this.getProjects();
            const currentUserId = String(this.user?.id || this.user?._id);
            if (!currentUserId) return [];

            return projects.filter(p => {
                const ownerId = String((typeof p.owner === 'object') ? (p.owner._id || p.owner.id) : p.owner);
                const isOwner = ownerId === currentUserId;
                const isMember = p.members && p.members.some(m => {
                    const mId = String((typeof m.user === 'object') ? (m.user._id || m.user.id) : m.user);
                    return mId === currentUserId;
                });
                return isMember && !isOwner;
            });
        } catch (err) {
            return [];
        }
    }

    // --- Application Methods ---

    async createApplication(projectId, roles, message) {
        try {
            const res = await fetch(`${this.API_URL}/projects/${projectId}/join`, {
                method: 'POST',
                headers: this._authHeader(),
                body: JSON.stringify({ roles, message })
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

    async getFriends() {
        try {
            const res = await fetch(`${this.API_URL}/friends`, {
                headers: this._authHeader()
            });
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error('getFriends error:', err);
            return [];
        }
    }

    async getFriendStatus(userId) {
        try {
            const res = await fetch(`${this.API_URL}/friends/status/${userId}`, {
                headers: this._authHeader()
            });
            if (!res.ok) return { status: 'none' };
            return await res.json();
        } catch (err) {
            console.error('getFriendStatus error:', err);
            return { status: 'none' };
        }
    }

    async getFriendRequests() {
        try {
            const res = await fetch(`${this.API_URL}/friends/requests`, {
                headers: this._authHeader()
            });
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error('getFriendRequests error:', err);
            return [];
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
        // This is a problem. The backend route is /projects/applications/:projectId/:appId
        // I should probably change the backend route to just /projects/applications/:appId if possible, 
        // but applications are embedded in projects.
        // So I need projectId.
        // I will update workspace.html to pass projectId.
        // For now, let's update the signature here.
        return { success: false, message: "Method signature update required: pass projectId" };
    }

    async updateApplicationStatusWithProject(projectId, appId, status, role = null) {
        try {
            const res = await fetch(`${this.API_URL}/projects/applications/${projectId}/${appId}`, {
                method: 'PUT',
                headers: this._authHeader(),
                body: JSON.stringify({ status, role })
            });
            if (!res.ok) throw new Error('Failed to update status');
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async getApplicationDetails(appId) {
        try {
            const res = await fetch(`${this.API_URL}/projects/application-details/${appId}`, {
                headers: this._authHeader()
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            return null;
        }
    }

    async getInvitation(id) {
        try {
            const res = await fetch(`${this.API_URL}/invitations/project/${id}`, {
                headers: this._authHeader()
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            return null;
        }
    }

    // --- Invitation & Social Methods ---

    async sendInvitation(toUserId, projectId, roles = [], message = '') {
        try {
            const res = await fetch(`${this.API_URL}/invitations/project`, {
                method: 'POST',
                headers: this._authHeader(),
                body: JSON.stringify({ toUserId, projectId, roles, message })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Failed to send invitation');
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async respondToInvitation(invitationId, status, role = 'Member') {
        try {
            const res = await fetch(`${this.API_URL}/invitations/project/${invitationId}/respond`, {
                method: 'POST',
                headers: this._authHeader(),
                body: JSON.stringify({ status, role })
            });
            if (!res.ok) throw new Error('Failed to respond to invitation');
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async sendFriendRequest(toUserId, message = '') {
        try {
            const res = await fetch(`${this.API_URL}/friends/request`, {
                method: 'POST',
                headers: this._authHeader(),
                body: JSON.stringify({ toUserId, message })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Failed to send friend request');
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async respondToFriendRequest(requestId, status) {
        try {
            const res = await fetch(`${this.API_URL}/friends/request/${requestId}/respond`, {
                method: 'POST',
                headers: this._authHeader(),
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('Failed to respond to request');
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    // --- Project Chat Methods ---

    async getChats(projectId) {
        try {
            const res = await fetch(`${this.API_URL}/chats/${projectId}`, {
                headers: this._authHeader()
            });
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error('getChats error:', err);
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

    // --- Inbox & Messaging Methods ---

    async getInbox() {
        try {
            const res = await fetch(`${this.API_URL}/inbox`, {
                headers: this._authHeader()
            });
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            return [];
        }
    }

    async getThreadMessages(threadId) {
        try {
            const res = await fetch(`${this.API_URL}/inbox/thread/${threadId}`, {
                headers: this._authHeader()
            });
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            return [];
        }
    }

    async sendMessage(threadId, text) {
        try {
            const res = await fetch(`${this.API_URL}/inbox/thread/${threadId}`, {
                method: 'POST',
                headers: this._authHeader(),
                body: JSON.stringify({ text })
            });
            if (!res.ok) throw new Error('Failed to send message');
            return await res.json();
        } catch (err) {
            return { error: err.message };
        }
    }

    async getOrCreateDM(userId) {
        try {
            const res = await fetch(`${this.API_URL}/inbox/dm/${userId}`, {
                method: 'POST',
                headers: this._authHeader()
            });
            if (!res.ok) throw new Error('Failed to start DM');
            return await res.json();
        } catch (err) {
            return { error: err.message };
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
    async markNotificationRead(id) {
        try {
            await fetch(`${this.API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: this._authHeader()
            });
            return true;
        } catch (err) {
            console.error('Error marking read:', err);
            return false;
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
                <a href="${rootPath}inbox.html" class="nav-link">Inbox</a>
            </nav>

            <div class="auth-actions" style="display: flex; align-items: center; gap: 1.5rem;">
                ${currentUser ? `
                    <!-- Notification Bell -->
                    <div style="position: relative; cursor: pointer;" id="notif-btn">
                        <div style="font-size: 1.25rem;">🔔</div>
                        <div id="notif-badge" style="display: none; position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: red; border-radius: 50%;"></div>
                        
                        <!-- Dropdown -->
                        <div id="notif-dropdown" style="display: none; position: absolute; top: 100%; right: 0; width: 300px; background: white; border: 1px solid var(--color-border); border-radius: 8px; box-shadow: var(--shadow-md); z-index: 100; max-height: 400px; overflow-y: auto;">
                            <div style="padding: 0.75rem; border-bottom: 1px solid var(--color-border); font-weight: 600; font-size: 0.9rem;">Notifications</div>
                            <div id="notif-list">
                                <div style="padding: 1rem; text-align: center; color: var(--color-text-secondary); font-size: 0.85rem;">Loading...</div>
                            </div>
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

    // Handle Notifications Asynchronously
    if (currentUser) {
        window.db.getNotifications().then(notifications => {
            const badge = document.getElementById('notif-badge');
            const list = document.getElementById('notif-list');
            if (notifications.length > 0) {
                if (badge) {
                    // Filter unread for badge
                    const unreadCount = notifications.filter(n => !n.isRead).length;

                    if (unreadCount > 0) {
                        badge.style.display = 'block';
                        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                    } else {
                        badge.style.display = 'none';
                    }
                }

                if (list) {
                    list.innerHTML = notifications.map(n => {
                        const fullLink = n.link ? (n.link.startsWith('http') ? n.link : rootPath + (n.link.startsWith('/') ? n.link.substring(1) : n.link)) : null;
                        return `
                        <div class="notification-item" 
                             ${fullLink ? `onclick="window.location.href='${fullLink}'"` : ''}
                             style="padding: 0.75rem; border-bottom: 1px solid var(--color-border); transition: background 0.2s; background: ${n.isRead ? '#f8f9fa' : 'white'}; opacity: ${n.isRead ? '0.7' : '1'}; cursor: ${fullLink ? 'pointer' : 'default'};">
                            <div style="font-size: 0.85rem; font-weight: ${n.isRead ? '500' : '700'}; margin-bottom: 0.25rem; color: var(--color-text-primary);">
                                ${n.isRead ? '' : '<span style="display:inline-block; width:6px; height:6px; background:var(--color-sogang-red); border-radius:50%; margin-right:4px;"></span>'}
                                ${fullLink ? `<a href="${fullLink}" onclick="event.stopPropagation()" style="text-decoration: none; color: inherit; font-weight: inherit;">${n.title}</a>` : n.title}
                            </div>
                            <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 0.5rem;">${n.message}</div>
                            
                            ${n.type === 'invitation' || n.type === 'request' || n.type === 'project_application' ? `
                                <div style="display: flex; gap: 0.5rem;">
                                    ${n.isRead ? '<span style="font-size:0.75rem; color:green;">Response Sent</span>' : `
                                        <button class="btn btn-primary notif-action-btn" data-id="${n._id}" data-type="${n.type}" data-related="${n.relatedId}" data-action="accept" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">Accept</button>
                                        <button class="btn btn-outline notif-action-btn" data-id="${n._id}" data-type="${n.type}" data-related="${n.relatedId}" data-action="decline" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">Decline</button>
                                    `}
                                </div>
                            ` : `
                                <a href="${rootPath + n.link}" class="btn btn-outline notif-view-link" data-id="${n._id}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; text-decoration: none; display: inline-block;">View</a>
                            `}
                        </div>
                        `;
                    }).join('');

                    // Add Event Listeners for "View" links
                    document.querySelectorAll('.notif-view-link').forEach(link => {
                        link.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const id = e.target.getAttribute('data-id');
                            window.db.markNotificationRead(id);
                        });
                    });

                    document.querySelectorAll('.notif-action-btn').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const { id, type, action, related } = e.target.dataset;
                            // Call backend API based on type
                            try {
                                let res;
                                // Mark as read first
                                await window.db.markNotificationRead(id);

                                if (type === 'project_application') {
                                    if (action === 'accept') {
                                        const details = await window.db.getApplicationDetails(related);
                                        if (!details) return alert('Application details not found');

                                        const roles = details.application.preferredRoles || [];
                                        let chosenRole = roles[0] || 'Member';

                                        if (roles.length > 1) {
                                            const choice = prompt(`Select role for "${details.application.applicantName}" in "${details.projectTitle}":\nChoices: ${roles.join(', ')}`, roles[0]);
                                            if (choice === null) return; // Cancelled
                                            if (roles.includes(choice)) {
                                                chosenRole = choice;
                                            } else {
                                                alert('Invalid choice');
                                                return;
                                            }
                                        }
                                        res = await window.db.updateApplicationStatusWithProject(details.projectId, related, 'ACCEPTED', chosenRole);
                                    } else {
                                        const details = await window.db.getApplicationDetails(related);
                                        if (!details) return alert('Application details not found');
                                        res = await window.db.updateApplicationStatusWithProject(details.projectId, related, 'REJECTED');
                                    }
                                } else if (type === 'invitation') {
                                    if (action === 'accept') {
                                        const invitation = await window.db.getInvitation(related);
                                        const roles = invitation ? (invitation.roles || []) : [];

                                        let chosenRole = roles[0] || 'Member';
                                        if (roles.length > 1) {
                                            const choice = prompt(`Select role for project "${invitation.project?.title || 'Project'}": (${roles.join(', ')})`, roles[0]);
                                            if (choice === null) return; // Cancelled
                                            if (roles.includes(choice)) {
                                                chosenRole = choice;
                                            } else {
                                                alert('Invalid role choice.');
                                                return;
                                            }
                                        }
                                        res = await window.db.respondToInvitation(related, 'accepted', chosenRole);
                                    } else {
                                        res = await window.db.respondToInvitation(related, 'declined');
                                    }
                                } else if (type === 'request') {
                                    const status = action === 'accept' ? 'accepted' : 'declined';
                                    res = await window.db.respondToFriendRequest(related, status);
                                }

                                if (res && res.success) {
                                    alert(`Successfully ${action}ed!`);
                                    window.location.reload();
                                } else {
                                    alert(`Failed to ${action}: ` + (res ? res.message : 'Unknown error'));
                                }
                            } catch (err) {
                                console.error(err);
                                alert('An error occurred while processing your request.');
                            }
                        });
                    });
                }
            } else {
                if (list) list.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--color-text-secondary); font-size: 0.85rem;">No new notifications</div>';
            }
        });
    }

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
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to log out?')) {
                    window.db.logout();
                }
            });
        }
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
