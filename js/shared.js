const DUMMY_CREDENTIALS = {
    user: { id: 'CUST12345', password: 'password' },
    support: { id: 'EMP54321', password: 'password' },
    vendor: { id: 'VEN98765', password: 'password' }
};

const DUMMY_MFA_CODE = '123456';
const DUMMY_SMS_CODE = '654321';

const SLA_CONFIG = {
    support: {
        critical: 2,
        high: 4,
        medium: 24,
        low: 120
    },
    vendor: {
        critical: 4,
        high: 8,
        medium: 48,
        low: 168
    }
};

const SUB_CATEGORIES = {
    'Incident': ['Hardware Failure', 'Software Issue', 'Network Problem', 'Access Issue', 'Performance Issue'],
    'Service Request': ['New User Setup', 'Password Reset', 'Access Request', 'Software Installation', 'Equipment Request'],
    'Change Request': ['Infrastructure Change', 'Application Update', 'Configuration Change'],
    'Problem': ['Root Cause Analysis', 'Known Error Investigation']
};

const SERVICE_CATALOG = [
    { name: 'Break-Fix Support', icon: 'fa-wrench', category: 'Incident', description: 'Report and resolve technical issues' },
    { name: 'Access Request', icon: 'fa-lock', category: 'Service Request', description: 'Request access to systems and applications' },
    { name: 'Password Reset', icon: 'fa-key', category: 'Service Request', description: 'Reset your account password' },
    { name: 'New User Onboarding', icon: 'fa-user-plus', category: 'Service Request', description: 'Setup new employee accounts and assets' },
    { name: 'Hardware Request', icon: 'fa-laptop', category: 'Service Request', description: 'Request new hardware equipment' },
    { name: 'Software Installation', icon: 'fa-download', category: 'Service Request', description: 'Install or update software applications' },
    { name: 'Network Issues', icon: 'fa-network-wired', category: 'Incident', description: 'Report network connectivity problems' },
    { name: 'Email Services', icon: 'fa-envelope', category: 'Service Request', description: 'Email configuration and support' },
    { name: 'VPN Access', icon: 'fa-shield-alt', category: 'Service Request', description: 'Request VPN access and support' },
    { name: 'Printer Support', icon: 'fa-print', category: 'Incident', description: 'Printer issues and setup' },
    { name: 'Mobile Device Support', icon: 'fa-mobile-alt', category: 'Service Request', description: 'Mobile device configuration' },
    { name: 'Collaboration Tools', icon: 'fa-users', category: 'Service Request', description: 'Teams, Zoom, and collaboration tools' }
];

const POPULAR_SERVICES = [
    { name: 'Cyber Security Services', icon: 'fa-shield-halved', category: 'Service Request' },
    { name: 'Server Management', icon: 'fa-server', category: 'Change Request' },
    { name: 'Access Request Services', icon: 'fa-key', category: 'Service Request' },
    { name: 'Software Services', icon: 'fa-laptop-code', category: 'Service Request' },
    { name: 'Storage & Backup', icon: 'fa-database', category: 'Service Request' },
    { name: 'C3i Services', icon: 'fa-chart-line', category: 'Service Request' },
    { name: 'Hardware Services', icon: 'fa-desktop', category: 'Service Request' },
    { name: 'Cloud Services', icon: 'fa-cloud', category: 'Service Request' }
];

const KB_ARTICLES = [
    { name: 'How to reset your password', type: 'KB Article', description: 'Step-by-step guide to reset your account password' },
    { name: 'VPN connection troubleshooting', type: 'KB Article', description: 'Common VPN issues and solutions' },
    { name: 'Email configuration guide', type: 'KB Article', description: 'Configure email on various devices' },
    { name: 'Wi-Fi connectivity issues', type: 'KB Article', description: 'Resolve wireless network problems' },
    { name: 'Software installation guide', type: 'KB Article', description: 'How to install approved software' },
    { name: 'Multi-factor authentication setup', type: 'KB Article', description: 'Enable MFA for your account' },
    { name: 'Remote desktop access', type: 'KB Article', description: 'Access your work computer remotely' },
    { name: 'File sharing and collaboration', type: 'KB Article', description: 'Share files securely' }
];

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

function getTickets() {
    return JSON.parse(localStorage.getItem('tickets')) || [];
}

function saveTickets(tickets) {
    localStorage.setItem('tickets', JSON.stringify(tickets));
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('currentUser'));
}

function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

function clearSession() {
    sessionStorage.removeItem('currentUser');
}

function logout() {
    clearSession();
    window.location.href = 'login.html';
}

function calculateDueDate(hours) {
    const now = new Date();
    const due = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    };
    
    return due.toLocaleString('en-US', options);
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function navigateTo(page, role) {
    const roleMap = {
        user: 'user.html',
        support: 'support.html',
        vendor: 'vendor.html'
    };
    window.location.href = role ? roleMap[role] : page;
}

function generateTicketId() {
    return `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

function updateTicket(ticketId, updates) {
    const tickets = getTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex >= 0) {
        tickets[ticketIndex] = { ...tickets[ticketIndex], ...updates, updatedAt: new Date().toISOString() };
        saveTickets(tickets);
        return tickets[ticketIndex];
    }
    return null;
}

function addTicketComment(ticketId, author, text) {
    const tickets = getTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex >= 0) {
        const comment = {
            author,
            text,
            time: new Date().toISOString()
        };
        tickets[ticketIndex].comments = tickets[ticketIndex].comments || [];
        tickets[ticketIndex].comments.push(comment);
        tickets[ticketIndex].updatedAt = new Date().toISOString();
        saveTickets(tickets);
        return comment;
    }
    return null;
}

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

let currentTicketId = null;

function updateTicketStatus() {
    if (!currentTicketId) return;
    
    const statusSelect = document.getElementById('action-status');
    const newStatus = statusSelect?.value;
    
    if (!newStatus) {
        alert('Please select a status');
        return;
    }
    
    const updated = updateTicket(currentTicketId, { status: newStatus });
    
    if (updated) {
        alert(`Ticket ${currentTicketId} status updated to: ${newStatus}`);
        hideModal('ticket-detail-modal');
        
        if (typeof loadSupportTickets === 'function') {
            loadSupportTickets();
            updateSupportStats();
        }
        if (typeof loadVendorTickets === 'function') {
            loadVendorTickets();
            updateVendorStats();
        }
    }
}

function reassignTicket() {
    if (!currentTicketId) return;
    
    const reassignSelect = document.getElementById('action-reassign');
    const newTeam = reassignSelect?.value;
    
    if (!newTeam) {
        alert('Please select a team');
        return;
    }
    
    const ticket = getTickets().find(t => t.id === currentTicketId);
    if (!ticket) return;
    
    const priorityLower = (ticket.priority || 'medium').toLowerCase();
    const slaHours = SLA_CONFIG[newTeam]?.[priorityLower] || 24;
    const updates = { 
        assignedTeam: newTeam,
        slaHours: slaHours,
        dueDate: calculateDueDate(slaHours)
    };
    
    const updated = updateTicket(currentTicketId, updates);
    
    if (updated) {
        alert(`Ticket ${currentTicketId} reassigned to: ${newTeam === 'support' ? 'Support Team' : 'Vendor Team'}`);
        hideModal('ticket-detail-modal');
        
        if (typeof loadSupportTickets === 'function') {
            loadSupportTickets();
            updateSupportStats();
        }
        if (typeof loadVendorTickets === 'function') {
            loadVendorTickets();
            updateVendorStats();
        }
    }
}

function addComment() {
    if (!currentTicketId) return;
    
    const commentInput = document.getElementById('new-comment');
    const commentText = commentInput?.value.trim();
    
    if (!commentText) {
        alert('Please enter a comment');
        return;
    }
    
    const user = getCurrentUser();
    const author = user.name || user.id;
    
    const comment = addTicketComment(currentTicketId, author, commentText);
    
    if (comment) {
        commentInput.value = '';
        
        const commentsContainer = document.getElementById('ticket-comments');
        if (commentsContainer) {
            const ticket = getTickets().find(t => t.id === currentTicketId);
            commentsContainer.innerHTML = (ticket.comments || []).map(c => `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${c.author}</span>
                        <span class="comment-time">${new Date(c.time).toLocaleString()}</span>
                    </div>
                    <p class="comment-text">${c.text}</p>
                </div>
            `).join('') || '<p class="no-tickets">No comments yet.</p>';
        }
    }
}
