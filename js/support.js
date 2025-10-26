// Support Team Dashboard JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const user = requireAuth();
    if (!user || user.role !== 'support') {
        logout();
        return;
    }
    
    initializeSupportDashboard(user);
});

let currentView = 'tickets';

function initializeSupportDashboard(user) {
    const usernameEl = document.getElementById('support-username');
    if (usernameEl) usernameEl.textContent = user.name || user.id;
    
    loadSupportTickets();
    updateSupportStats();
    setupSupportFilters();
    setupSupportSearch();
    setupSupportNavigation();
}

function loadSupportTickets(filters = {}) {
    const tickets = getTickets();
    let supportTickets = tickets.filter(t => t.assignedTeam === 'support');
    
    if (filters.status) {
        supportTickets = supportTickets.filter(t => t.status === filters.status);
    }
    if (filters.priority) {
        supportTickets = supportTickets.filter(t => t.priority === filters.priority);
    }
    if (filters.team) {
        supportTickets = supportTickets.filter(t => t.assignedTeam === filters.team);
    }
    
    const tableContainer = document.getElementById('support-tickets-table');
    if (!tableContainer) return;
    
    if (supportTickets.length === 0) {
        tableContainer.innerHTML = '<p class="no-tickets">No tickets found matching the filters.</p>';
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
                ${supportTickets.sort((a, b) => 
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
                                <button class="btn-icon" onclick="viewSupportTicket('${ticket.id}')" title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon" onclick="showQuickActions('${ticket.id}', 'support')" title="Quick Actions">
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

function updateSupportStats() {
    const tickets = getTickets();
    const supportTickets = tickets.filter(t => t.assignedTeam === 'support');
    
    const newCount = supportTickets.filter(t => t.status === 'New').length;
    const inProgressCount = supportTickets.filter(t => t.status === 'In Progress').length;
    const pendingCount = supportTickets.filter(t => t.status === 'Pending').length;
    
    const now = new Date();
    const slaRiskCount = supportTickets.filter(t => {
        if (['Resolved', 'Closed'].includes(t.status)) return false;
        const due = new Date(t.dueDate);
        const hoursRemaining = (due - now) / (1000 * 60 * 60);
        return hoursRemaining < 2;
    }).length;
    
    const statNew = document.getElementById('stat-new');
    const statInProgress = document.getElementById('stat-inprogress');
    const statPending = document.getElementById('stat-pending');
    const statSla = document.getElementById('stat-sla');
    
    if (statNew) statNew.textContent = newCount;
    if (statInProgress) statInProgress.textContent = inProgressCount;
    if (statPending) statPending.textContent = pendingCount;
    if (statSla) statSla.textContent = slaRiskCount;
}

function setupSupportFilters() {
    const statusFilter = document.getElementById('filter-status');
    const priorityFilter = document.getElementById('filter-priority');
    const teamFilter = document.getElementById('filter-team');
    
    const applyFilters = () => {
        const filters = {
            status: statusFilter?.value || '',
            priority: priorityFilter?.value || '',
            team: teamFilter?.value || ''
        };
        loadSupportTickets(filters);
    };
    
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (priorityFilter) priorityFilter.addEventListener('change', applyFilters);
    if (teamFilter) teamFilter.addEventListener('change', applyFilters);
}

function setupSupportSearch() {
    const searchInput = document.getElementById('support-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const tickets = getTickets();
        const supportTickets = tickets.filter(t => t.assignedTeam === 'support');
        
        if (query.length < 2) {
            loadSupportTickets();
            return;
        }
        
        const filtered = supportTickets.filter(ticket => 
            ticket.id.toLowerCase().includes(query) ||
            ticket.title.toLowerCase().includes(query) ||
            ticket.description.toLowerCase().includes(query) ||
            ticket.createdBy.toLowerCase().includes(query)
        );
        
        renderFilteredTickets(filtered);
    });
}

function renderFilteredTickets(tickets) {
    const tableContainer = document.getElementById('support-tickets-table');
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
                                <button class="btn-icon" onclick="viewSupportTicket('${ticket.id}')" title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon" onclick="showQuickActions('${ticket.id}', 'support')" title="Quick Actions">
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

function viewSupportTicket(ticketId) {
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

function showQuickActions(ticketId, role) {
    const ticket = getTickets().find(t => t.id === ticketId);
    if (!ticket) return;
    
    const actions = role === 'support' ? [
        { label: 'Mark In Progress', status: 'In Progress', condition: ticket.status === 'New' || ticket.status === 'Open' },
        { label: 'Mark Pending', status: 'Pending', condition: ticket.status === 'In Progress' },
        { label: 'Mark Resolved', status: 'Resolved', condition: ticket.status !== 'Resolved' && ticket.status !== 'Closed' },
        { label: 'Assign to Vendor', team: 'vendor', condition: true }
    ] : [
        { label: 'Mark In Progress', status: 'In Progress', condition: ticket.status === 'New' || ticket.status === 'Open' },
        { label: 'Mark Resolved', status: 'Resolved', condition: ticket.status !== 'Resolved' && ticket.status !== 'Closed' },
        { label: 'Return to Support', team: 'support', condition: true }
    ];
    
    const validActions = actions.filter(a => a.condition);
    
    if (validActions.length === 0) {
        alert('No actions available for this ticket.');
        return;
    }
    
    const actionText = validActions.map((a, i) => `${i + 1}. ${a.label}`).join('\n');
    const choice = prompt(`Quick Actions for Ticket #${ticketId}:\n\n${actionText}\n\nEnter number:`);
    
    if (!choice) return;
    
    const selectedAction = validActions[parseInt(choice) - 1];
    if (!selectedAction) return;
    
    if (selectedAction.status) {
        updateTicket(ticketId, { status: selectedAction.status });
    }
    if (selectedAction.team) {
        updateTicket(ticketId, { assignedTeam: selectedAction.team });
    }
    
    loadSupportTickets();
    updateSupportStats();
}

function setupSupportNavigation() {
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const linkText = link.textContent.trim();
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            if (linkText === 'Ticket Queue') {
                showTicketQueueView();
            } else if (linkText === 'Analytics') {
                showAnalyticsView();
            } else if (linkText === 'Users') {
                showUsersView();
            }
        });
    });
}

function showTicketQueueView() {
    currentView = 'tickets';
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
                    <select id="filter-team" class="filter-select">
                        <option value="">All Teams</option>
                        <option value="support">Support Team</option>
                        <option value="vendor">Vendor Team</option>
                    </select>
                </div>
            </div>

            <div id="support-tickets-table" class="tickets-table"></div>
        </div>
    `;
    
    setupSupportFilters();
    loadSupportTickets();
    updateSupportStats();
}

function showAnalyticsView() {
    currentView = 'analytics';
    const dashboardContent = document.querySelector('.dashboard-content');
    if (!dashboardContent) return;
    
    const tickets = getTickets();
    const supportTickets = tickets.filter(t => t.assignedTeam === 'support');
    
    const totalTickets = supportTickets.length;
    const resolvedTickets = supportTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
    const avgResolutionTime = '24 hours';
    
    const priorityBreakdown = {
        critical: supportTickets.filter(t => t.priority === 'critical').length,
        high: supportTickets.filter(t => t.priority === 'high').length,
        medium: supportTickets.filter(t => t.priority === 'medium').length,
        low: supportTickets.filter(t => t.priority === 'low').length
    };
    
    dashboardContent.innerHTML = `
        <h2>Analytics Dashboard</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-ticket-alt"></i>
                </div>
                <div class="stat-info">
                    <h3>${totalTickets}</h3>
                    <p>Total Tickets</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
                    <h3>${resolvedTickets}</h3>
                    <p>Resolved Tickets</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
                    <h3>${avgResolutionTime}</h3>
                    <p>Avg Resolution Time</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-percentage"></i>
                </div>
                <div class="stat-info">
                    <h3>${totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0}%</h3>
                    <p>Resolution Rate</p>
                </div>
            </div>
        </div>
        
        <div class="analytics-section" style="margin-top: 2rem;">
            <h3>Priority Breakdown</h3>
            <div class="priority-stats" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 1rem;">
                <div class="priority-stat-card" style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4 style="color: #e74c3c;">Critical</h4>
                    <p style="font-size: 2rem; font-weight: 600; margin: 0.5rem 0;">${priorityBreakdown.critical}</p>
                </div>
                <div class="priority-stat-card" style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4 style="color: #e67e22;">High</h4>
                    <p style="font-size: 2rem; font-weight: 600; margin: 0.5rem 0;">${priorityBreakdown.high}</p>
                </div>
                <div class="priority-stat-card" style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4 style="color: #f39c12;">Medium</h4>
                    <p style="font-size: 2rem; font-weight: 600; margin: 0.5rem 0;">${priorityBreakdown.medium}</p>
                </div>
                <div class="priority-stat-card" style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4 style="color: #3498db;">Low</h4>
                    <p style="font-size: 2rem; font-weight: 600; margin: 0.5rem 0;">${priorityBreakdown.low}</p>
                </div>
            </div>
        </div>
        
        <div class="analytics-section" style="margin-top: 2rem;">
            <h3>SLA Compliance</h3>
            <div style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 1rem;">
                <p style="font-size: 1.2rem;">Overall SLA Compliance: <strong>94%</strong></p>
                <p style="margin-top: 1rem; color: #666;">Support Team SLA: High Priority (4h), Medium (24h), Low (120h)</p>
            </div>
        </div>
    `;
}

function showUsersView() {
    currentView = 'users';
    const dashboardContent = document.querySelector('.dashboard-content');
    if (!dashboardContent) return;
    
    const users = getUsers();
    const allUsers = [
        { id: 'CUST12345', name: 'Demo User', role: 'user', email: 'demo@example.com' },
        { id: 'EMP54321', name: 'Support Agent', role: 'support', email: 'support@example.com' },
        { id: 'VEN98765', name: 'Vendor Team', role: 'vendor', email: 'vendor@example.com' },
        ...users
    ];
    
    dashboardContent.innerHTML = `
        <h2>User Management</h2>
        <div style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 1rem;">
            <table class="tickets-table-view">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${allUsers.map(user => `
                        <tr>
                            <td><strong>${user.id}</strong></td>
                            <td>${user.name || (user.firstName ? `${user.firstName} ${user.lastName}` : 'N/A')}</td>
                            <td><span class="priority-badge ${user.role}">${user.role}</span></td>
                            <td>${user.email || 'N/A'}</td>
                            <td><span class="status-badge open">Active</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
