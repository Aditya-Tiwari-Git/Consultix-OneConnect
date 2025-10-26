// User Dashboard JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const user = requireAuth();
    if (!user || user.role !== 'user') {
        logout();
        return;
    }
    
    initializeUserDashboard(user);
});

function initializeUserDashboard(user) {
    renderServiceCatalog();
    renderPopularServices();
    setupUserSearch();
    setupTicketCreation();
    loadUserTickets(user);
    updateUserStats(user);
    setupUserNavigation();
    setupAssetTabs();
}

function renderServiceCatalog() {
    const catalogGrid = document.getElementById('catalog-grid');
    if (!catalogGrid) return;
    
    catalogGrid.innerHTML = SERVICE_CATALOG.map(service => `
        <div class="catalog-card" onclick="openTicketModal('${service.name}', '${service.category}')">
            <div class="catalog-icon">
                <i class="fas ${service.icon}"></i>
            </div>
            <h3>${service.name}</h3>
            <p>${service.description}</p>
        </div>
    `).join('');
}

function renderPopularServices() {
    const popularGrid = document.getElementById('popular-topics');
    if (!popularGrid) return;
    
    popularGrid.innerHTML = POPULAR_SERVICES.map(service => `
        <div class="topic-card" onclick="openTicketModal('${service.name}', '${service.category}')">
            <i class="fas ${service.icon}"></i>
            <span>${service.name}</span>
        </div>
    `).join('');
}

function setupUserSearch() {
    const globalSearch = document.getElementById('global-search');
    const heroSearch = document.getElementById('hero-search');
    const globalSearchResults = document.getElementById('search-results');
    const heroSearchResults = document.getElementById('hero-search-results');
    
    function handleGlobalSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            if (globalSearchResults) globalSearchResults.style.display = 'none';
            return;
        }
        
        const results = performUserSearch(query);
        displaySearchResults(results, globalSearchResults);
    }
    
    function handleHeroSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            if (heroSearchResults) heroSearchResults.style.display = 'none';
            return;
        }
        
        const results = performUserSearch(query);
        displaySearchResults(results, heroSearchResults);
    }
    
    if (globalSearch) globalSearch.addEventListener('input', handleGlobalSearch);
    if (heroSearch) heroSearch.addEventListener('input', handleHeroSearch);
}

function performUserSearch(query) {
    const results = [];
    
    SERVICE_CATALOG.forEach(item => {
        if (item.name.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query)) {
            results.push({
                ...item,
                type: 'Service',
                clickable: true
            });
        }
    });
    
    KB_ARTICLES.forEach(article => {
        if (article.name.toLowerCase().includes(query) || 
            article.description.toLowerCase().includes(query)) {
            results.push({
                ...article,
                clickable: true
            });
        }
    });
    
    const tickets = getTickets();
    const user = getCurrentUser();
    if (user) {
        const userTickets = tickets.filter(t => t.createdBy === user.id);
        userTickets.forEach(ticket => {
            if (ticket.title.toLowerCase().includes(query) || 
                ticket.description.toLowerCase().includes(query)) {
                results.push({
                    name: ticket.title,
                    type: 'Ticket',
                    description: `#${ticket.id} - ${ticket.status}`,
                    icon: 'fa-ticket-alt',
                    clickable: true,
                    ticketId: ticket.id
                });
            }
        });
    }
    
    return results;
}

function displaySearchResults(results, container) {
    if (!container) return;
    
    if (results.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.innerHTML = results.slice(0, 5).map(result => `
        <div class="search-result-item" onclick='handleSearchResultClick(${JSON.stringify(result)})'>
            <i class="fas ${result.icon || 'fa-file-alt'}"></i>
            <div class="search-result-info">
                <strong>${result.name}</strong>
                <small>${result.type || 'Article'}: ${result.description || ''}</small>
            </div>
        </div>
    `).join('');
    
    container.style.display = 'block';
}

function handleSearchResultClick(result) {
    const globalSearchResults = document.getElementById('search-results');
    const heroSearchResults = document.getElementById('hero-search-results');
    
    if (globalSearchResults) globalSearchResults.style.display = 'none';
    if (heroSearchResults) heroSearchResults.style.display = 'none';
    
    const globalSearch = document.getElementById('global-search');
    const heroSearch = document.getElementById('hero-search');
    
    if (globalSearch) globalSearch.value = '';
    if (heroSearch) heroSearch.value = '';
    
    if (result.ticketId) {
        viewTicket(result.ticketId);
    } else if (result.type === 'Service' || result.type === 'Service Request' || result.type === 'Incident') {
        openTicketModal(result.name, result.category || result.type);
    } else {
        alert(`Knowledge Base: ${result.name}\n\n${result.description}`);
    }
}

function setupTicketCreation() {
    const createBtn = document.getElementById('create-ticket-btn');
    if (createBtn) {
        createBtn.addEventListener('click', () => openTicketModal());
    }
    
    setupTicketModal();
}

function setupTicketModal() {
    const modal = document.getElementById('ticket-modal');
    if (!modal) return;
    
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.btn-secondary');
    const submitBtn = modal.querySelector('.btn-primary');
    const categorySelect = document.getElementById('ticket-category');
    const subcategorySelect = document.getElementById('ticket-subcategory');
    
    if (closeBtn) closeBtn.addEventListener('click', () => hideModal('ticket-modal'));
    if (cancelBtn) cancelBtn.addEventListener('click', () => hideModal('ticket-modal'));
    
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            const category = e.target.value;
            if (subcategorySelect && SUB_CATEGORIES[category]) {
                subcategorySelect.innerHTML = '<option value="">Select Sub-category</option>' +
                    SUB_CATEGORIES[category].map(sub => `<option value="${sub}">${sub}</option>`).join('');
                subcategorySelect.disabled = false;
            }
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => createTicket());
    }
}

function openTicketModal(serviceName = '', category = '') {
    const modal = document.getElementById('ticket-modal');
    if (!modal) return;
    
    const titleInput = document.getElementById('ticket-title');
    const categorySelect = document.getElementById('ticket-category');
    
    if (titleInput) titleInput.value = serviceName;
    if (categorySelect && category) categorySelect.value = category;
    
    if (categorySelect && category && SUB_CATEGORIES[category]) {
        const subcategorySelect = document.getElementById('ticket-subcategory');
        if (subcategorySelect) {
            subcategorySelect.innerHTML = '<option value="">Select Sub-category</option>' +
                SUB_CATEGORIES[category].map(sub => `<option value="${sub}">${sub}</option>`).join('');
            subcategorySelect.disabled = false;
        }
    }
    
    showModal('ticket-modal');
}

function createTicket() {
    const user = getCurrentUser();
    
    const title = document.getElementById('ticket-title').value.trim();
    const description = document.getElementById('ticket-description').value.trim();
    const category = document.getElementById('ticket-category').value;
    const subcategory = document.getElementById('ticket-subcategory').value;
    const urgency = document.getElementById('ticket-urgency').value;
    const impact = document.getElementById('ticket-impact').value;
    
    if (!title || !description || !category) {
        alert('Please fill in all required fields');
        return;
    }
    
    const priority = calculatePriority(urgency, impact);
    const assignedTeam = category === 'Incident' ? 'support' : 'support';
    const slaHours = SLA_CONFIG[assignedTeam][priority];
    
    const ticket = {
        id: generateTicketId(),
        title,
        description,
        category,
        subcategory,
        urgency,
        impact,
        priority,
        status: 'New',
        assignedTeam,
        createdBy: user.id,
        createdByName: user.name || user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: calculateDueDate(slaHours),
        slaHours,
        comments: []
    };
    
    const tickets = getTickets();
    tickets.push(ticket);
    saveTickets(tickets);
    
    hideModal('ticket-modal');
    
    document.getElementById('ticket-title').value = '';
    document.getElementById('ticket-description').value = '';
    document.getElementById('ticket-category').value = '';
    document.getElementById('ticket-subcategory').value = '';
    
    loadUserTickets(user);
    updateUserStats(user);
    
    alert(`Ticket ${ticket.id} created successfully!`);
}

function calculatePriority(urgency, impact) {
    const matrix = {
        'high-high': 'critical',
        'high-medium': 'high',
        'high-low': 'medium',
        'medium-high': 'high',
        'medium-medium': 'medium',
        'medium-low': 'low',
        'low-high': 'medium',
        'low-medium': 'low',
        'low-low': 'low'
    };
    return matrix[`${urgency}-${impact}`] || 'medium';
}

function loadUserTickets(user) {
    const tickets = getTickets();
    const userTickets = tickets.filter(t => t.createdBy === user.id);
    
    const ticketsList = document.getElementById('user-tickets-list');
    if (!ticketsList) return;
    
    if (userTickets.length === 0) {
        ticketsList.innerHTML = '<p class="no-tickets">No tickets yet. Create one to get started!</p>';
        return;
    }
    
    ticketsList.innerHTML = userTickets.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    ).map(ticket => `
        <div class="ticket-card" onclick="viewTicket('${ticket.id}')">
            <div class="ticket-header">
                <span class="ticket-number">#${ticket.id}</span>
                <span class="priority-badge ${ticket.priority}">${ticket.priority}</span>
            </div>
            <h4>${ticket.title}</h4>
            <p class="ticket-status">Status: ${ticket.status}</p>
            <p class="ticket-date">Created: ${new Date(ticket.createdAt).toLocaleDateString()}</p>
        </div>
    `).join('');
}

function updateUserStats(user) {
    const tickets = getTickets();
    const userTickets = tickets.filter(t => t.createdBy === user.id);
    const openTickets = userTickets.filter(t => 
        !['Resolved', 'Closed'].includes(t.status)
    );
    
    const openCountEl = document.getElementById('user-open-count');
    if (openCountEl) openCountEl.textContent = openTickets.length;
}

function viewTicket(ticketId) {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;
    
    const modal = document.getElementById('ticket-detail-modal');
    if (!modal) return;
    
    document.getElementById('detail-ticket-id').textContent = ticket.id;
    document.getElementById('detail-ticket-title').textContent = ticket.title;
    document.getElementById('detail-ticket-status').textContent = ticket.status;
    document.getElementById('detail-ticket-status').className = `status-badge ${ticket.status.toLowerCase().replace(' ', '-')}`;
    document.getElementById('detail-ticket-priority').textContent = ticket.priority;
    document.getElementById('detail-ticket-priority').className = `priority-badge ${ticket.priority}`;
    document.getElementById('detail-ticket-description').textContent = ticket.description;
    document.getElementById('detail-ticket-created').textContent = new Date(ticket.createdAt).toLocaleString();
    document.getElementById('detail-ticket-updated').textContent = new Date(ticket.updatedAt).toLocaleString();
    document.getElementById('detail-ticket-due').textContent = ticket.dueDate;
    
    const commentsContainer = document.getElementById('ticket-comments');
    if (commentsContainer) {
        commentsContainer.innerHTML = (ticket.comments || []).map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <strong>${comment.author}</strong>
                    <span>${new Date(comment.time).toLocaleString()}</span>
                </div>
                <p>${comment.text}</p>
            </div>
        `).join('') || '<p>No comments yet.</p>';
    }
    
    showModal('ticket-detail-modal');
    
    const closeBtn = modal.querySelector('.close-modal');
    const closeButton = modal.querySelector('.btn-secondary');
    if (closeBtn) closeBtn.onclick = () => hideModal('ticket-detail-modal');
    if (closeButton) closeButton.onclick = () => hideModal('ticket-detail-modal');
}

function setupUserNavigation() {
    const myTasksLink = document.querySelector('.header-link[href="#"]:first-of-type');
    const myRequestsLink = document.querySelector('.header-link[href="#"]:last-of-type');
    const notificationBtn = document.querySelector('.icon-btn .fa-bell');
    const activityItems = document.querySelectorAll('.activity-item');
    
    if (myTasksLink) {
        myTasksLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('My Tasks feature coming soon!\n\nThis will show all tasks assigned to you.');
        });
    }
    
    if (myRequestsLink) {
        myRequestsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const user = getCurrentUser();
            const tickets = getTickets();
            const userTickets = tickets.filter(t => t.createdBy === user.id);
            
            if (userTickets.length === 0) {
                alert('You have no active requests yet.\n\nCreate a ticket to get started!');
            } else {
                const ticketsList = document.getElementById('user-tickets-list');
                if (ticketsList) {
                    ticketsList.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
    
    if (notificationBtn && notificationBtn.parentElement) {
        notificationBtn.parentElement.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Notifications\n\nYou have no new notifications.');
        });
    }
    
    activityItems.forEach((item, index) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            if (index === 0) {
                alert('Tasks\n\nYou have no pending tasks.');
            } else {
                const ticketsList = document.getElementById('user-tickets-list');
                if (ticketsList) {
                    ticketsList.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

function setupAssetTabs() {
    const assetTabs = document.querySelectorAll('.asset-tab');
    
    assetTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            assetTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabName = tab.textContent.trim();
            if (tabName === 'Software') {
                alert('Software Assets\n\nYou have the following software licenses:\n• Microsoft Office 365\n• Adobe Creative Cloud\n• Zoom Pro License');
            }
        });
    });
}
