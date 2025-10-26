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

let currentUser = null;
let currentRole = 'user';
let tickets = JSON.parse(localStorage.getItem('tickets')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentTicket = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupLoginPage();
    setupRegistrationPage();
    setupMFAModals();
    setupAuthTabs();
    if (currentUser) {
        showDashboard(currentUser.role);
    }
}

function setupAuthTabs() {
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            if (tabName === 'login') {
                document.getElementById('login-tab').classList.add('active');
            } else {
                document.getElementById('register-tab').classList.add('active');
            }
        });
    });
}

function setupLoginPage() {
    const roleButtons = document.querySelectorAll('#login-tab .role-btn');
    const loginForm = document.getElementById('login-form');
    const loginId = document.getElementById('login-id');
    const idLabel = document.getElementById('id-label');
    const hint = document.querySelector('#login-tab .hint');

    roleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#login-tab .role-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRole = btn.dataset.role;

            switch(currentRole) {
                case 'user':
                    idLabel.textContent = 'Customer ID';
                    loginId.placeholder = 'Enter your Customer ID';
                    hint.textContent = 'Example: CUST12345';
                    break;
                case 'support':
                    idLabel.textContent = 'Employee ID';
                    loginId.placeholder = 'Enter your Employee ID';
                    hint.textContent = 'Example: EMP54321';
                    break;
                case 'vendor':
                    idLabel.textContent = 'Vendor ID';
                    loginId.placeholder = 'Enter your Vendor ID';
                    hint.textContent = 'Example: VEN98765';
                    break;
            }
        });
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = loginId.value.trim();
        const password = document.getElementById('login-password').value;

        if (id === DUMMY_CREDENTIALS[currentRole].id && password === DUMMY_CREDENTIALS[currentRole].password) {
            currentUser = { id, role: currentRole, name: currentRole.charAt(0).toUpperCase() + currentRole.slice(1) + ' User' };
            showMFAModal();
        } else {
            const hashedPassword = simpleHash(password);
            const registeredUser = users.find(u => u.id === id && u.password === hashedPassword && u.role === currentRole);
            if (registeredUser) {
                currentUser = { ...registeredUser };
                showMFAModal();
            } else {
                alert('Invalid credentials. Please try again.\n\nHint: Use the example ID shown and password: "password"');
            }
        }
    });
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

function setupRegistrationPage() {
    const roleButtons = document.querySelectorAll('#register-tab .role-btn');
    const registerForm = document.getElementById('register-form');

    roleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#register-tab .role-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRole = btn.dataset.role;
        });
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const firstName = document.getElementById('reg-firstname').value.trim();
        const lastName = document.getElementById('reg-lastname').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const department = document.getElementById('reg-department').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }

        let prefix = '';
        switch(currentRole) {
            case 'user':
                prefix = 'CUST';
                break;
            case 'support':
                prefix = 'EMP';
                break;
            case 'vendor':
                prefix = 'VEN';
                break;
        }

        const userId = `${prefix}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        const newUser = {
            id: userId,
            role: currentRole,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            email,
            phone,
            department,
            password: simpleHash(password),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        alert(`Registration successful!\n\nYour ${currentRole === 'user' ? 'Customer' : currentRole === 'support' ? 'Employee' : 'Vendor'} ID: ${userId}\n\nPlease use this ID to login.`);

        registerForm.reset();
        document.querySelector('.auth-tab[data-tab="login"]').click();
    });
}

function setupMFAModals() {
    const mfaModal = document.getElementById('mfa-modal');
    const smsModal = document.getElementById('sms-modal');
    const mfaVerifyBtn = document.getElementById('mfa-verify');
    const smsVerifyBtn = document.getElementById('sms-verify');
    const mfaCancelBtn = document.getElementById('mfa-cancel');
    const smsCancelBtn = document.getElementById('sms-cancel');
    const switchToSMS = document.getElementById('switch-to-sms');
    const switchToMFA = document.getElementById('switch-to-mfa');

    switchToSMS.addEventListener('click', (e) => {
        e.preventDefault();
        mfaModal.classList.remove('active');
        smsModal.classList.add('active');
    });

    switchToMFA.addEventListener('click', (e) => {
        e.preventDefault();
        smsModal.classList.remove('active');
        mfaModal.classList.add('active');
    });

    mfaVerifyBtn.addEventListener('click', () => {
        const code = document.getElementById('mfa-code').value;
        if (code === DUMMY_MFA_CODE) {
            mfaModal.classList.remove('active');
            showDashboard(currentUser.role);
        } else {
            alert('Invalid MFA code. Try: 123456');
        }
    });

    smsVerifyBtn.addEventListener('click', () => {
        const code = document.getElementById('sms-code').value;
        if (code === DUMMY_SMS_CODE) {
            smsModal.classList.remove('active');
            showDashboard(currentUser.role);
        } else {
            alert('Invalid SMS code. Try: 654321');
        }
    });

    mfaCancelBtn.addEventListener('click', () => {
        mfaModal.classList.remove('active');
    });

    smsCancelBtn.addEventListener('click', () => {
        smsModal.classList.remove('active');
    });
}

function showMFAModal() {
    document.getElementById('mfa-modal').classList.add('active');
    document.getElementById('mfa-code').value = '';
}

function showDashboard(role) {
    document.getElementById('login-page').classList.remove('active');

    switch(role) {
        case 'user':
            window.location.hash = '#/user/dashboard';
            setupUserDashboard();
            document.getElementById('user-dashboard').classList.add('active');
            break;
        case 'support':
            window.location.hash = '#/support/dashboard';
            setupSupportDashboard();
            document.getElementById('support-dashboard').classList.add('active');
            break;
        case 'vendor':
            window.location.hash = '#/vendor/dashboard';
            setupVendorDashboard();
            document.getElementById('vendor-dashboard').classList.add('active');
            break;
    }
}

function setupUserDashboard() {
    renderCatalog();
    renderPopularServices();
    renderUserTickets();
    setupUserSearch();
    setupTicketCreation();

    const userOpenCount = tickets.filter(t => t.createdBy === currentUser.id && ['New', 'Open', 'In Progress', 'Pending'].includes(t.status)).length;
    document.getElementById('user-open-count').textContent = userOpenCount;
}

function renderCatalog() {
    const catalogGrid = document.getElementById('catalog-grid');
    catalogGrid.innerHTML = SERVICE_CATALOG.map(service => `
        <div class="catalog-card" onclick="openTicketModal('${service.category}', '${service.name}')">
            <div class="card-header">
                <span class="card-badge"><i class="fas fa-check"></i> ${service.category}</span>
                <button class="icon-btn" onclick="event.stopPropagation()"><i class="far fa-heart"></i></button>
            </div>
            <div class="card-icon">
                <i class="fas ${service.icon}"></i>
            </div>
            <h3>${service.name}</h3>
            <p>${service.description}</p>
        </div>
    `).join('');
}

function renderPopularServices() {
    const topicsGrid = document.getElementById('popular-topics');
    topicsGrid.innerHTML = POPULAR_SERVICES.map(service => `
        <div class="topic-card" onclick="openTicketModal('${service.category}', '${service.name}')">
            <div class="topic-icon">
                <i class="fas ${service.icon}"></i>
            </div>
            <h4>${service.name}</h4>
        </div>
    `).join('');
}

function setupUserSearch() {
    const globalSearch = document.getElementById('global-search');
    const heroSearch = document.getElementById('hero-search');
    const searchResults = document.getElementById('search-results');

    [globalSearch, heroSearch].forEach(searchInput => {
        if (!searchInput) return;
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length > 0) {
                const results = performSearch(query);
                displaySearchResults(results);
            } else {
                searchResults.classList.remove('active');
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container') && !e.target.closest('.search-container-large')) {
            searchResults.classList.remove('active');
        }
    });
}

function performSearch(query) {
    const results = [];

    SERVICE_CATALOG.forEach(item => {
        if (item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)) {
            results.push({ ...item, type: 'Service' });
        }
    });

    POPULAR_SERVICES.forEach(item => {
        if (item.name.toLowerCase().includes(query)) {
            results.push({ ...item, type: 'Service' });
        }
    });

    KB_ARTICLES.forEach(article => {
        if (article.name.toLowerCase().includes(query) || article.description.toLowerCase().includes(query)) {
            results.push(article);
        }
    });

    const userTickets = tickets.filter(t => t.createdBy === currentUser.id);
    userTickets.forEach(ticket => {
        if (ticket.title.toLowerCase().includes(query) || ticket.category.toLowerCase().includes(query)) {
            results.push({
                name: ticket.title,
                type: 'My Ticket',
                description: `${ticket.id} - ${ticket.category} - ${ticket.status}`
            });
        }
    });

    return results.slice(0, 8);
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item"><div class="search-result-title">No results found</div></div>';
    } else {
        searchResults.innerHTML = results.map(result => `
            <div class="search-result-item">
                <div class="search-result-title">${result.name}</div>
                <div class="search-result-type">${result.type} • ${result.description || ''}</div>
            </div>
        `).join('');
    }
    
    searchResults.classList.add('active');
}

function setupTicketCreation() {
    const createTicketBtn = document.getElementById('create-ticket-btn');
    createTicketBtn.addEventListener('click', () => openTicketModal());
}

function renderUserTickets() {
    const userTicketsList = document.getElementById('user-tickets-list');
    const userTickets = tickets.filter(t => t.createdBy === currentUser.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (userTickets.length === 0) {
        userTicketsList.innerHTML = '<p class="empty-state">No tickets created yet</p>';
    } else {
        userTicketsList.innerHTML = userTickets.slice(0, 5).map(ticket => `
            <div class="past-ticket" onclick="viewTicketDetail('${ticket.id}')">
                <div class="ticket-header-info">
                    <span class="ticket-id">${ticket.id}</span>
                    <span class="ticket-priority ${ticket.priority}">${ticket.priority}</span>
                </div>
                <div class="ticket-title">${ticket.title}</div>
                <div class="ticket-meta">
                    ${ticket.status} • Due: ${ticket.dueDate}
                </div>
            </div>
        `).join('');
    }
}

function setupSupportDashboard() {
    updateSupportStats();
    renderSupportTickets();
    setupSupportFilters();
    document.getElementById('support-username').textContent = currentUser.name;
}

function updateSupportStats() {
    const newTickets = tickets.filter(t => t.status === 'New').length;
    const inProgress = tickets.filter(t => t.status === 'In Progress').length;
    const pending = tickets.filter(t => t.status === 'Pending').length;
    
    const now = new Date();
    const slaRisk = tickets.filter(t => {
        if (['Resolved', 'Closed'].includes(t.status)) return false;
        const due = new Date(t.dueDate);
        const hoursRemaining = (due - now) / (1000 * 60 * 60);
        return hoursRemaining < 2;
    }).length;

    document.getElementById('stat-new').textContent = newTickets;
    document.getElementById('stat-inprogress').textContent = inProgress;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-sla').textContent = slaRisk;
}

function renderSupportTickets(filters = {}) {
    let filteredTickets = [...tickets];

    if (filters.status) {
        filteredTickets = filteredTickets.filter(t => t.status === filters.status);
    }
    if (filters.priority) {
        filteredTickets = filteredTickets.filter(t => t.priority === filters.priority);
    }
    if (filters.team) {
        filteredTickets = filteredTickets.filter(t => t.team === filters.team);
    }

    filteredTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const tableHtml = `
        <div class="ticket-row ticket-row-header">
            <div>Ticket ID</div>
            <div>Description</div>
            <div>Status</div>
            <div>Priority</div>
            <div>Team</div>
            <div>Created</div>
            <div>Action</div>
        </div>
        ${filteredTickets.map(ticket => `
            <div class="ticket-row" onclick="viewTicketDetail('${ticket.id}')">
                <div>${ticket.id}</div>
                <div>${ticket.title}</div>
                <div><span class="status-badge ${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span></div>
                <div><span class="priority-badge ${ticket.priority}">${ticket.priority}</span></div>
                <div>${ticket.team === 'support' ? 'Support Team' : 'Vendor Team'}</div>
                <div>${new Date(ticket.createdAt).toLocaleDateString()}</div>
                <div><i class="fas fa-eye"></i></div>
            </div>
        `).join('')}
    `;

    document.getElementById('support-tickets-table').innerHTML = tableHtml;
}

function setupSupportFilters() {
    const statusFilter = document.getElementById('filter-status');
    const priorityFilter = document.getElementById('filter-priority');
    const teamFilter = document.getElementById('filter-team');

    const applyFilters = () => {
        renderSupportTickets({
            status: statusFilter.value,
            priority: priorityFilter.value,
            team: teamFilter.value
        });
    };

    statusFilter.addEventListener('change', applyFilters);
    priorityFilter.addEventListener('change', applyFilters);
    teamFilter.addEventListener('change', applyFilters);
}

function setupVendorDashboard() {
    updateVendorStats();
    renderVendorTickets();
    setupVendorFilters();
    document.getElementById('vendor-username').textContent = currentUser.name;
}

function updateVendorStats() {
    const vendorTickets = tickets.filter(t => t.team === 'vendor');
    const assigned = vendorTickets.filter(t => !['Resolved', 'Closed'].includes(t.status)).length;
    const inProgress = vendorTickets.filter(t => t.status === 'In Progress').length;
    
    const today = new Date().toDateString();
    const resolvedToday = vendorTickets.filter(t => t.status === 'Resolved' && new Date(t.updatedAt).toDateString() === today).length;

    document.getElementById('vendor-stat-assigned').textContent = assigned;
    document.getElementById('vendor-stat-inprogress').textContent = inProgress;
    document.getElementById('vendor-stat-resolved').textContent = resolvedToday;
}

function renderVendorTickets(filters = {}) {
    let vendorTickets = tickets.filter(t => t.team === 'vendor');

    if (filters.status) {
        vendorTickets = vendorTickets.filter(t => t.status === filters.status);
    }
    if (filters.priority) {
        vendorTickets = vendorTickets.filter(t => t.priority === filters.priority);
    }

    vendorTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const tableHtml = `
        <div class="ticket-row ticket-row-header">
            <div>Ticket ID</div>
            <div>Description</div>
            <div>Status</div>
            <div>Priority</div>
            <div>SLA Due</div>
            <div>Action</div>
        </div>
        ${vendorTickets.map(ticket => `
            <div class="ticket-row" onclick="viewTicketDetail('${ticket.id}')">
                <div>${ticket.id}</div>
                <div>${ticket.title}</div>
                <div><span class="status-badge ${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span></div>
                <div><span class="priority-badge ${ticket.priority}">${ticket.priority}</span></div>
                <div>${ticket.dueDate}</div>
                <div><i class="fas fa-eye"></i></div>
            </div>
        `).join('')}
    `;

    document.getElementById('vendor-tickets-table').innerHTML = tableHtml;
}

function setupVendorFilters() {
    const statusFilter = document.getElementById('vendor-filter-status');
    const priorityFilter = document.getElementById('vendor-filter-priority');

    const applyFilters = () => {
        renderVendorTickets({
            status: statusFilter.value,
            priority: priorityFilter.value
        });
    };

    statusFilter.addEventListener('change', applyFilters);
    priorityFilter.addEventListener('change', applyFilters);
}

function openTicketModal(category = '', serviceName = '') {
    const modal = document.getElementById('ticket-modal');
    const categorySelect = document.getElementById('ticket-category');
    const titleInput = document.getElementById('ticket-title');

    categorySelect.value = category;
    if (serviceName) {
        titleInput.value = `Request for ${serviceName}`;
    } else {
        titleInput.value = '';
    }

    updateSubcategories();
    
    document.getElementById('ticket-subcategory').value = '';
    document.getElementById('ticket-priority').value = '';
    document.getElementById('ticket-urgency').value = '';
    document.getElementById('ticket-impact').value = '';
    document.getElementById('ticket-affected-user').value = '';
    document.getElementById('ticket-location').value = '';
    document.getElementById('ticket-team').value = '';
    document.getElementById('ticket-due').value = '';
    document.getElementById('ticket-description').value = '';
    document.getElementById('ticket-notes').value = '';
    document.getElementById('sla-info').style.display = 'none';

    setupTicketModalHandlers();
    modal.classList.add('active');
}

function setupTicketModalHandlers() {
    const categorySelect = document.getElementById('ticket-category');
    const prioritySelect = document.getElementById('ticket-priority');
    const teamSelect = document.getElementById('ticket-team');
    const closeBtn = document.getElementById('close-ticket-modal');
    const cancelBtn = document.getElementById('cancel-ticket');
    const submitBtn = document.getElementById('submit-ticket');

    categorySelect.onchange = updateSubcategories;
    prioritySelect.onchange = updateSLAInfo;
    teamSelect.onchange = updateSLAInfo;

    closeBtn.onclick = () => {
        document.getElementById('ticket-modal').classList.remove('active');
    };

    cancelBtn.onclick = () => {
        document.getElementById('ticket-modal').classList.remove('active');
    };

    submitBtn.onclick = createTicket;
}

function updateSubcategories() {
    const category = document.getElementById('ticket-category').value;
    const subcategorySelect = document.getElementById('ticket-subcategory');

    if (category && SUB_CATEGORIES[category]) {
        subcategorySelect.innerHTML = '<option value="">Select Sub-Category</option>' + 
            SUB_CATEGORIES[category].map(sub => `<option value="${sub}">${sub}</option>`).join('');
        subcategorySelect.disabled = false;
    } else {
        subcategorySelect.innerHTML = '<option value="">Select Sub-Category</option>';
        subcategorySelect.disabled = true;
    }
}

function updateSLAInfo() {
    const priority = document.getElementById('ticket-priority').value;
    const team = document.getElementById('ticket-team').value;
    const slaInfo = document.getElementById('sla-info');
    const slaText = document.getElementById('sla-text');
    const dueInput = document.getElementById('ticket-due');

    if (priority && team) {
        const hours = SLA_CONFIG[team][priority];
        const dueDate = calculateDueDate(hours);
        
        let timeText = '';
        if (hours < 24) {
            timeText = `${hours} hour${hours > 1 ? 's' : ''}`;
        } else {
            const days = Math.floor(hours / 24);
            timeText = `${days} day${days > 1 ? 's' : ''}`;
        }

        slaText.textContent = `SLA Resolution Time: ${timeText} for ${priority.charAt(0).toUpperCase() + priority.slice(1)} priority tickets assigned to ${team === 'support' ? 'Support Team' : 'Vendor Team'}`;
        dueInput.value = dueDate;
        slaInfo.style.display = 'flex';
    } else {
        slaInfo.style.display = 'none';
        dueInput.value = '';
    }
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

function createTicket() {
    const category = document.getElementById('ticket-category').value.trim();
    const subcategory = document.getElementById('ticket-subcategory').value.trim();
    const priority = document.getElementById('ticket-priority').value;
    const urgency = document.getElementById('ticket-urgency').value;
    const impact = document.getElementById('ticket-impact').value;
    const affectedUser = document.getElementById('ticket-affected-user').value.trim();
    const location = document.getElementById('ticket-location').value.trim();
    const team = document.getElementById('ticket-team').value;
    const title = document.getElementById('ticket-title').value.trim();
    const description = document.getElementById('ticket-description').value.trim();
    const notes = document.getElementById('ticket-notes').value.trim();

    if (!category || !subcategory || !priority || !urgency || !impact || !team || !title || !description) {
        alert('Please fill in all required fields');
        return;
    }

    const ticketId = `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const hours = SLA_CONFIG[team][priority];
    const dueDate = calculateDueDate(hours);
    
    const ticket = {
        id: ticketId,
        category,
        subcategory,
        priority,
        urgency,
        impact,
        affectedUser: affectedUser || currentUser.name,
        location,
        team,
        title,
        description,
        notes,
        dueDate,
        status: 'New',
        createdBy: currentUser.id,
        createdByName: currentUser.name,
        assignedTo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: []
    };

    tickets.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(tickets));
    
    document.getElementById('ticket-modal').classList.remove('active');
    
    alert(`Ticket ${ticketId} created successfully!\nResolution due: ${dueDate}`);

    if (currentUser.role === 'user') {
        renderUserTickets();
        const userOpenCount = tickets.filter(t => t.createdBy === currentUser.id && ['New', 'Open', 'In Progress', 'Pending'].includes(t.status)).length;
        document.getElementById('user-open-count').textContent = userOpenCount;
    } else if (currentUser.role === 'support') {
        updateSupportStats();
        renderSupportTickets();
    }
}

function viewTicketDetail(ticketId) {
    currentTicket = tickets.find(t => t.id === ticketId);
    if (!currentTicket) return;

    document.getElementById('detail-ticket-id').textContent = ticketId;
    document.getElementById('detail-status').textContent = currentTicket.status;
    document.getElementById('detail-status').className = `status-badge ${currentTicket.status.toLowerCase().replace(' ', '-')}`;
    document.getElementById('detail-priority').textContent = currentTicket.priority;
    document.getElementById('detail-priority').className = `priority-badge ${currentTicket.priority}`;
    document.getElementById('detail-category').textContent = currentTicket.category;
    document.getElementById('detail-subcategory').textContent = currentTicket.subcategory;
    document.getElementById('detail-title').textContent = currentTicket.title;
    document.getElementById('detail-description').textContent = currentTicket.description;
    document.getElementById('detail-team').textContent = currentTicket.team === 'support' ? 'Support Team' : 'Vendor Team';
    document.getElementById('detail-assignee').textContent = currentTicket.assignedTo || 'Unassigned';
    document.getElementById('detail-creator').textContent = currentTicket.createdByName;
    document.getElementById('detail-due').textContent = currentTicket.dueDate;
    document.getElementById('detail-created').textContent = new Date(currentTicket.createdAt).toLocaleString();
    document.getElementById('detail-updated').textContent = new Date(currentTicket.updatedAt).toLocaleString();

    const now = new Date();
    const due = new Date(currentTicket.dueDate);
    const hoursRemaining = Math.max(0, (due - now) / (1000 * 60 * 60));
    document.getElementById('detail-time-remaining').textContent = hoursRemaining > 0 ? `${Math.floor(hoursRemaining)} hours` : 'Overdue';

    renderComments();

    document.getElementById('action-status').value = '';
    document.getElementById('action-reassign').value = '';

    setupDetailModalHandlers();
    document.getElementById('ticket-detail-modal').classList.add('active');
}

function renderComments() {
    const commentsList = document.getElementById('ticket-comments');
    if (currentTicket.comments.length === 0) {
        commentsList.innerHTML = '<p class="empty-state">No comments yet</p>';
    } else {
        commentsList.innerHTML = currentTicket.comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-time">${new Date(comment.time).toLocaleString()}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `).join('');
    }
}

function setupDetailModalHandlers() {
    const closeBtn = document.getElementById('close-detail-modal');
    closeBtn.onclick = () => {
        document.getElementById('ticket-detail-modal').classList.remove('active');
    };
}

function addComment() {
    const commentText = document.getElementById('new-comment').value.trim();
    if (!commentText) return;

    const comment = {
        author: currentUser.name,
        text: commentText,
        time: new Date().toISOString()
    };

    currentTicket.comments.push(comment);
    currentTicket.updatedAt = new Date().toISOString();

    const ticketIndex = tickets.findIndex(t => t.id === currentTicket.id);
    tickets[ticketIndex] = currentTicket;
    localStorage.setItem('tickets', JSON.stringify(tickets));

    document.getElementById('new-comment').value = '';
    renderComments();
}

function updateTicketStatus() {
    const newStatus = document.getElementById('action-status').value;
    if (!newStatus) {
        alert('Please select a status');
        return;
    }

    currentTicket.status = newStatus;
    currentTicket.updatedAt = new Date().toISOString();

    const ticketIndex = tickets.findIndex(t => t.id === currentTicket.id);
    tickets[ticketIndex] = currentTicket;
    localStorage.setItem('tickets', JSON.stringify(tickets));

    const comment = {
        author: currentUser.name,
        text: `Status changed to: ${newStatus}`,
        time: new Date().toISOString()
    };
    currentTicket.comments.push(comment);
    tickets[ticketIndex] = currentTicket;
    localStorage.setItem('tickets', JSON.stringify(tickets));

    viewTicketDetail(currentTicket.id);

    if (currentUser.role === 'support') {
        updateSupportStats();
        renderSupportTickets();
    } else if (currentUser.role === 'vendor') {
        updateVendorStats();
        renderVendorTickets();
    }

    alert(`Ticket status updated to: ${newStatus}`);
}

function reassignTicket() {
    const newTeam = document.getElementById('action-reassign').value;
    if (!newTeam) {
        alert('Please select a team to reassign');
        return;
    }

    currentTicket.team = newTeam;
    currentTicket.updatedAt = new Date().toISOString();

    const hours = SLA_CONFIG[newTeam][currentTicket.priority];
    currentTicket.dueDate = calculateDueDate(hours);

    const ticketIndex = tickets.findIndex(t => t.id === currentTicket.id);
    tickets[ticketIndex] = currentTicket;
    localStorage.setItem('tickets', JSON.stringify(tickets));

    const comment = {
        author: currentUser.name,
        text: `Ticket reassigned to: ${newTeam === 'support' ? 'Support Team' : 'Vendor Team'}`,
        time: new Date().toISOString()
    };
    currentTicket.comments.push(comment);
    tickets[ticketIndex] = currentTicket;
    localStorage.setItem('tickets', JSON.stringify(tickets));

    viewTicketDetail(currentTicket.id);

    if (currentUser.role === 'support') {
        renderSupportTickets();
    } else if (currentUser.role === 'vendor') {
        renderVendorTickets();
    }

    alert(`Ticket reassigned to: ${newTeam === 'support' ? 'Support Team' : 'Vendor Team'}`);
}

function logout() {
    currentUser = null;
    tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    
    window.location.hash = '#/login';
    
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('login-page').classList.add('active');
    
    document.getElementById('login-form').reset();
}

window.addEventListener('hashchange', handleRouting);

function handleRouting() {
    const hash = window.location.hash;
    
    if (!currentUser && !hash.includes('login')) {
        window.location.hash = '#/login';
        return;
    }

    if (hash === '#/login' || hash === '') {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('login-page').classList.add('active');
    }
}
