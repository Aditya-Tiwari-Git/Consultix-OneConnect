// Vendor Dashboard JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const user = requireAuth();
    if (!user || user.role !== 'vendor') {
        logout();
        return;
    }
    
    initializeVendorDashboard(user);
});

let currentView = 'assignments';

function initializeVendorDashboard(user) {
    const usernameEl = document.getElementById('vendor-username');
    if (usernameEl) usernameEl.textContent = user.name || user.id;
    
    loadVendorTickets();
    updateVendorStats();
    setupVendorFilters();
    setupVendorSearch();
    setupVendorNavigation();
}

function loadVendorTickets(filters = {}) {
    const tickets = getTickets();
    let vendorTickets = tickets.filter(t => t.assignedTeam === 'vendor');
    
    if (filters.status) {
        vendorTickets = vendorTickets.filter(t => t.status === filters.status);
    }
    if (filters.priority) {
        vendorTickets = vendorTickets.filter(t => t.priority === filters.priority);
    }
    
    const tableContainer = document.getElementById('vendor-tickets-table');
    if (!tableContainer) return;
    
    if (vendorTickets.length === 0) {
        tableContainer.innerHTML = '<p class="no-tickets">No tickets assigned to your team.</p>';
        return;
    }
    
    tableContainer.innerHTML = `
        <table class="tickets-table-view">
            <thead>
                <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Created</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${vendorTickets.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                ).map(ticket => `
                    <tr>
                        <td><strong>#${ticket.id}</strong></td>
                        <td>${ticket.title}</td>
                        <td><span class="priority-badge ${ticket.priority}">${ticket.priority}</span></td>
                        <td><span class="status-badge ${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span></td>
                        <td>${ticket.createdByName || ticket.createdBy}</td>
                        <td>${new Date(ticket.createdAt).toLocaleDateString()}</td>
                        <td>${ticket.dueDate}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon" onclick="viewVendorTicket('${ticket.id}')" title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon" onclick="showQuickActions('${ticket.id}', 'vendor')" title="Quick Actions">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function updateVendorStats() {
    const tickets = getTickets();
    const vendorTickets = tickets.filter(t => t.assignedTeam === 'vendor');
    
    const assignedCount = vendorTickets.filter(t => !['Resolved', 'Closed'].includes(t.status)).length;
    const inProgressCount = vendorTickets.filter(t => t.status === 'In Progress').length;
    
    const today = new Date().toDateString();
    const resolvedTodayCount = vendorTickets.filter(t => 
        (t.status === 'Resolved' || t.status === 'Closed') && 
        new Date(t.updatedAt).toDateString() === today
    ).length;
    
    const statAssigned = document.getElementById('vendor-stat-assigned');
    const statInProgress = document.getElementById('vendor-stat-inprogress');
    const statResolved = document.getElementById('vendor-stat-resolved');
    
    if (statAssigned) statAssigned.textContent = assignedCount;
    if (statInProgress) statInProgress.textContent = inProgressCount;
    if (statResolved) statResolved.textContent = resolvedTodayCount;
    
    const statNew = document.getElementById('stat-new');
    const statPending = document.getElementById('stat-pending');
    const statSla = document.getElementById('stat-sla');
    
    if (statNew) {
        const newCount = vendorTickets.filter(t => t.status === 'New').length;
        statNew.textContent = newCount;
    }
    if (statInProgress) {
        const inProgress = vendorTickets.filter(t => t.status === 'In Progress').length;
        statInProgress.textContent = inProgress;
    }
    if (statPending) {
        const pendingCount = vendorTickets.filter(t => t.status === 'Pending').length;
        statPending.textContent = pendingCount;
    }
    if (statSla) {
        const now = new Date();
        const slaRiskCount = vendorTickets.filter(t => {
            if (['Resolved', 'Closed'].includes(t.status)) return false;
            const due = new Date(t.dueDate);
            const hoursRemaining = (due - now) / (1000 * 60 * 60);
            return hoursRemaining < 4;
        }).length;
        statSla.textContent = slaRiskCount;
    }
}

function setupVendorFilters() {
    const statusFilter = document.getElementById('filter-status');
    const priorityFilter = document.getElementById('filter-priority');
    
    const applyFilters = () => {
        const filters = {
            status: statusFilter?.value || '',
            priority: priorityFilter?.value || ''
        };
        loadVendorTickets(filters);
    };
    
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (priorityFilter) priorityFilter.addEventListener('change', applyFilters);
}

function setupVendorSearch() {
    const searchInput = document.getElementById('vendor-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const tickets = getTickets();
        const vendorTickets = tickets.filter(t => t.assignedTeam === 'vendor');
        
        if (query.length < 2) {
            loadVendorTickets();
            return;
        }
        
        const filtered = vendorTickets.filter(ticket => 
            ticket.id.toLowerCase().includes(query) ||
            ticket.title.toLowerCase().includes(query) ||
            ticket.description.toLowerCase().includes(query) ||
            ticket.createdBy.toLowerCase().includes(query)
        );
        
        renderFilteredVendorTickets(filtered);
    });
}

function renderFilteredVendorTickets(tickets) {
    const tableContainer = document.getElementById('vendor-tickets-table');
    if (!tableContainer) return;
    
    if (tickets.length === 0) {
        tableContainer.innerHTML = '<p class="no-tickets">No tickets found.</p>';
        return;
    }
    
    tableContainer.innerHTML = `
        <table class="tickets-table-view">
            <thead>
                <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Created</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tickets.map(ticket => `
                    <tr>
                        <td><strong>#${ticket.id}</strong></td>
                        <td>${ticket.title}</td>
                        <td><span class="priority-badge ${ticket.priority}">${ticket.priority}</span></td>
                        <td><span class="status-badge ${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span></td>
                        <td>${ticket.createdByName || ticket.createdBy}</td>
                        <td>${new Date(ticket.createdAt).toLocaleDateString()}</td>
                        <td>${ticket.dueDate}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon" onclick="viewVendorTicket('${ticket.id}')" title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon" onclick="showQuickActions('${ticket.id}', 'vendor')" title="Quick Actions">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function viewVendorTicket(ticketId) {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;
    
    const modal = document.getElementById('ticket-detail-modal');
    if (!modal) {
        alert(`Ticket Details:\n\nID: ${ticket.id}\nTitle: ${ticket.title}\nStatus: ${ticket.status}\nPriority: ${ticket.priority}\n\nDescription: ${ticket.description}`);
        return;
    }
    
    currentTicketId = ticketId;
    
    document.getElementById('detail-ticket-id').textContent = ticket.id;
    document.getElementById('detail-title').textContent = ticket.title;
    document.getElementById('detail-description').textContent = ticket.description;
    document.getElementById('detail-category').textContent = ticket.category || 'N/A';
    document.getElementById('detail-subcategory').textContent = ticket.subcategory || 'N/A';
    
    const statusBadge = document.getElementById('detail-status');
    statusBadge.textContent = ticket.status;
    statusBadge.className = `status-badge ${ticket.status.toLowerCase().replace(' ', '-')}`;
    
    const priorityBadge = document.getElementById('detail-priority');
    priorityBadge.textContent = ticket.priority;
    priorityBadge.className = `priority-badge ${ticket.priority}`;
    
    document.getElementById('detail-team').textContent = ticket.assignedTeam === 'support' ? 'Support Team' : 'Vendor Team';
    document.getElementById('detail-creator').textContent = ticket.createdByName || ticket.createdBy;
    document.getElementById('detail-due').textContent = ticket.dueDate;
    document.getElementById('detail-created').textContent = new Date(ticket.createdAt).toLocaleString();
    document.getElementById('detail-updated').textContent = new Date(ticket.updatedAt).toLocaleString();
    
    const commentsContainer = document.getElementById('ticket-comments');
    if (commentsContainer) {
        commentsContainer.innerHTML = (ticket.comments || []).map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-time">${new Date(comment.time).toLocaleString()}</span>
                </div>
                <p class="comment-text">${comment.text}</p>
            </div>
        `).join('') || '<p class="no-tickets">No comments yet.</p>';
    }
    
    showModal('ticket-detail-modal');
    
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            hideModal('ticket-detail-modal');
            currentTicketId = null;
        };
    }
}

function setupVendorNavigation() {
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const linkText = link.textContent.trim();
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            if (linkText === 'My Assignments') {
                showMyAssignmentsView();
            } else if (linkText === 'Resolved') {
                showResolvedView();
            }
        });
    });
}

function showMyAssignmentsView() {
    currentView = 'assignments';
    const dashboardContent = document.querySelector('.dashboard-content');
    if (!dashboardContent) return;
    
    dashboardContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon new">
                    <i class="fas fa-inbox"></i>
                </div>
                <div class="stat-info">
                    <h3 id="stat-new">0</h3>
                    <p>New Tickets</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon inprogress">
                    <i class="fas fa-spinner"></i>
                </div>
                <div class="stat-info">
                    <h3 id="stat-inprogress">0</h3>
                    <p>In Progress</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon pending">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
                    <h3 id="stat-pending">0</h3>
                    <p>Pending</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon sla">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="stat-info">
                    <h3 id="stat-sla">0</h3>
                    <p>SLA Breach Risk</p>
                </div>
            </div>
        </div>

        <div class="ticket-management">
            <div class="ticket-filters">
                <h3>Ticket Queue</h3>
                <div class="filter-group">
                    <select id="filter-status" class="filter-select">
                        <option value="">All Status</option>
                        <option value="New">New</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>
                    <select id="filter-priority" class="filter-select">
                        <option value="">All Priority</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            <div id="vendor-tickets-table" class="tickets-table"></div>
        </div>
    `;
    
    setupVendorFilters();
    loadVendorTickets();
    updateVendorStats();
}

function showResolvedView() {
    currentView = 'resolved';
    const dashboardContent = document.querySelector('.dashboard-content');
    if (!dashboardContent) return;
    
    const tickets = getTickets();
    const vendorTickets = tickets.filter(t => t.assignedTeam === 'vendor');
    const resolvedTickets = vendorTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
    
    dashboardContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
                    <h3>${resolvedTickets.length}</h3>
                    <p>Resolved Tickets</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
                    <h3>24h</h3>
                    <p>Avg Resolution Time</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-percentage"></i>
                </div>
                <div class="stat-info">
                    <h3>${vendorTickets.length > 0 ? Math.round((resolvedTickets.length / vendorTickets.length) * 100) : 0}%</h3>
                    <p>Resolution Rate</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-star"></i>
                </div>
                <div class="stat-info">
                    <h3>4.8/5</h3>
                    <p>Customer Rating</p>
                </div>
            </div>
        </div>
        
        <div class="ticket-management" style="margin-top: 2rem;">
            <h3>Resolved Tickets</h3>
            ${resolvedTickets.length === 0 ? 
                '<p class="no-tickets">No resolved tickets yet.</p>' :
                `<table class="tickets-table-view">
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Title</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Resolved Date</th>
                            <th>Resolution Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${resolvedTickets.sort((a, b) => 
                            new Date(b.updatedAt) - new Date(a.updatedAt)
                        ).map(ticket => {
                            const created = new Date(ticket.createdAt);
                            const resolved = new Date(ticket.updatedAt);
                            const hoursToResolve = Math.round((resolved - created) / (1000 * 60 * 60));
                            
                            return `
                                <tr>
                                    <td><strong>#${ticket.id}</strong></td>
                                    <td>${ticket.title}</td>
                                    <td><span class="priority-badge ${ticket.priority}">${ticket.priority}</span></td>
                                    <td><span class="status-badge ${ticket.status.toLowerCase()}">${ticket.status}</span></td>
                                    <td>${resolved.toLocaleDateString()}</td>
                                    <td>${hoursToResolve}h</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>`
            }
        </div>
    `;
}
