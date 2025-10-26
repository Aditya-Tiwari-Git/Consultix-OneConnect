# ONE Connect - IT Service Management Portal

## Overview

ONE Connect by Consultix is a comprehensive enterprise IT service management (ITSM) ticketing system built as a front-end demo application. Inspired by ServiceNow, the system provides a complete ticketing workflow for three distinct user roles with separate dedicated dashboards: end users (customers), internal support teams, and external vendors.

The application features role-based authentication with registration, complete ticket lifecycle management, advanced service catalog, knowledge base access, SLA-based priority handling, ticket assignment/reassignment, work notes, analytics dashboards, and filtering capabilities.

The system is designed as a multi-page web application using vanilla HTML, CSS, and JavaScript with separate pages for each user role, sessionStorage for authentication, and browser localStorage for data persistence (no backend infrastructure required).

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (October 2025)

- **Multi-Page Architecture Refactoring** (October 25, 2025):
  - Converted from single-page to multi-page architecture
  - Created separate HTML files: login.html, user.html, support.html, vendor.html
  - Modularized JavaScript: js/shared.js, js/auth.js, js/user.js, js/support.js, js/vendor.js
  - Implemented role-based authentication with automatic routing to appropriate dashboards
  - Enhanced all dashboards with full navigation functionality

- **User Dashboard Enhancements**:
  - Made all navigation links functional (My Tasks, My Requests, notifications)
  - Clickable search suggestions that auto-populate ticket creation forms
  - Interactive activity items with smooth scrolling
  - Asset tabs switching between Hardware and Software views
  - Complete ticket creation workflow with urgency/impact priority matrix

- **Support Dashboard Enhancements**:
  - Analytics page with comprehensive metrics (total tickets, resolution rate, avg time, SLA compliance)
  - Priority breakdown visualization (Critical, High, Medium, Low)
  - Users Management page showing all registered users
  - View navigation between Ticket Queue, Analytics, and Users
  - Quick action buttons for status changes and vendor assignment
  - Ticket filtering by status, priority, and team

- **Vendor Dashboard Enhancements**:
  - Resolved Tickets page with resolution statistics and customer ratings
  - Resolution time tracking for each ticket
  - View navigation between My Assignments and Resolved
  - Quick action buttons for status changes and returning tickets to support
  - Team-specific SLA tracking (8h/48h/168h for critical/high/medium/low)

- **Replit Environment Setup** (October 25, 2025): 
  - Configured Python 3.11 for HTTP server
  - Created server.py with SimpleHTTPRequestHandler for static file serving
  - Set up workflow "Web Server" to serve static files on port 5000 (0.0.0.0)
  - Added Cache-Control headers to prevent aggressive browser caching
  - Added .gitignore for Python and system files
  - Configured deployment settings for autoscale deployment using Python HTTP server

## System Architecture

### Frontend Architecture

**Technology Stack**
- Pure HTML5, CSS3, and vanilla JavaScript (no frameworks)
- Font Awesome 6.4.0 for iconography
- Google Fonts (Poppins family) for typography
- localStorage API for client-side data persistence

**Design Pattern**
- Multi-page application architecture with role-specific HTML pages (login.html, user.html, support.html, vendor.html)
- Modular JavaScript with shared utilities (shared.js), authentication (auth.js), and dashboard-specific controllers (user.js, support.js, vendor.js)
- State management through sessionStorage (authentication) and localStorage (tickets, users)
- Event-driven UI updates using DOM manipulation
- Modal-based workflows for ticket creation and authentication flows
- Dynamic view switching within dashboards for Analytics, Users Management, and Resolved Tickets pages

**UI/UX Design System**
- CSS custom properties (variables) for theming and consistent styling
- Gradient-based color scheme (primary: purple-blue gradient, secondary: pink-red gradient)
- Card-based layout for content organization
- Responsive design principles with mobile-first considerations
- Shadow hierarchy (sm, md, lg, xl) for depth perception

### Authentication & Authorization

**Role-Based Access Control**
- Three distinct user roles: User (customer), Support Team (employee), Vendor
- Role-specific credentials with different ID prefixes (CUST*, EMP*, VEN*)
- Dummy credentials hardcoded for demo purposes
- Multi-factor authentication (MFA) flow with dummy codes (123456 for authenticator, 654321 for SMS)
- Role determines dashboard view, available actions, and SLA configurations

**Authentication Flow**
1. Role selection on login page
2. Credential validation against dummy data
3. MFA modal presentation (with option to switch to SMS)
4. Session establishment with user context storage
5. Role-based dashboard rendering

### Ticket Management System

**Ticket Lifecycle**
- Creation through service catalog items or manual entry
- Status tracking (implied: open, in-progress, resolved)
- Priority-based classification (high, medium, low)
- Assignment to support team or vendor based on ticket type
- SLA tracking with role-specific resolution timeframes

**Service Catalog Structure**
- 11 predefined catalog items across categories:
  - Infrastructure (Server Management, Storage & Backup)
  - Security (Cyber Security Services)
  - End User Services (Break-Fix Support, Onboarding, Hardware)
  - Access Management (Access Request Services)
  - Software & Collaboration tools
  - Specialized services (C3i Services)

**Knowledge Base Integration**
- Searchable KB articles for self-service
- Articles categorized by common IT support topics (password reset, VPN, email config)
- Real-time search filtering across catalog items, KB articles, and tickets

### SLA Management

**Tiered Resolution Times**
- Support Team SLA hours: High (4h), Medium (24h), Low (120h/5 days)
- Vendor Team SLA hours: High (8h), Medium (48h), Low (168h/7 days)
- Priority levels determine SLA application
- Role-specific SLA configurations allow different service expectations

### Data Persistence Strategy

**localStorage Schema**
- Tickets array stored as JSON in browser localStorage
- Key: 'tickets'
- Ticket object structure includes: ID, title, description, priority, status, timestamps, assigned team
- Client-side only - no backend synchronization
- Data persists across browser sessions until explicitly cleared

### Search & Filter Functionality

**Unified Search System**
- Real-time filtering across multiple data sources
- Searchable entities: Catalog items, KB articles, User's tickets
- Search scope: Names, descriptions, ticket details
- Instantaneous results update without page reload

### Modal-Based Workflows

**Interactive Modals**
- Authentication flows (MFA/SMS verification)
- Ticket creation and editing
- Detail views for tickets and assets
- Confirmation dialogs for critical actions
- Overlay-based UI pattern for focused user interactions

## External Dependencies

### Third-Party Libraries & Services

**Font Awesome 6.4.0 (CDN)**
- Purpose: Icon library for UI elements
- Source: cdnjs.cloudflare.com
- Usage: Navigation icons, status indicators, action buttons

**Google Fonts API**
- Font Family: Poppins (weights: 300, 400, 500, 600, 700)
- Purpose: Typography system for modern, clean interface
- Delivery: Google Fonts CDN with preconnect optimization

### Browser APIs

**Web Storage API (localStorage)**
- Purpose: Client-side ticket data persistence
- Capacity: Typically 5-10MB per origin
- Data format: JSON serialized ticket objects

**DOM APIs**
- Event handling for user interactions
- Dynamic content rendering and page transitions
- Form validation and submission handling

### No Backend Infrastructure

The application operates entirely in the browser with no server-side components:
- No database server (all data in localStorage)
- No API endpoints or REST services
- No authentication server (dummy credential validation)
- No real-time synchronization or WebSocket connections
- No file upload or external storage services

### Future Integration Points

Areas designed for potential backend integration:
- Ticket persistence could migrate to REST API with database
- Authentication system ready for OAuth/SSO integration
- SLA calculations could connect to monitoring systems
- Knowledge base could integrate with CMS or documentation platforms
- Real-time notifications via WebSocket or push services