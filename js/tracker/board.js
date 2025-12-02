/**
 * Application Tracker Kanban Board
 * Handles drag-and-drop, filtering, and board operations
 */

class KanbanBoard {
  constructor(containerId, storage) {
    this.container = document.getElementById(containerId);
    this.storage = storage;
    this.draggedCard = null;
    this.filters = {
      search: '',
      priority: null,
      favorite: false,
      tags: [],
      source: null
    };

    this.BOARD_COLUMNS = [
      { id: 'saved', name: 'Saved / Interested', color: '#6b7280' },
      { id: 'preparing', name: 'Preparing Application', color: '#3b82f6' },
      { id: 'applied', name: 'Applied', color: '#8b5cf6' },
      { id: 'phone-screen', name: 'Phone Screen', color: '#ec4899' },
      { id: 'interview', name: 'Interview', color: '#f59e0b' },
      { id: 'final-round', name: 'Final Round', color: '#f97316' },
      { id: 'offer', name: 'Offer', color: '#10b981' },
      { id: 'rejected', name: 'Rejected', color: '#ef4444' },
      { id: 'withdrawn', name: 'Withdrawn', color: '#64748b' }
    ];

    this.init();
  }

  /**
   * Initialize board
   */
  init() {
    if (!this.container) {
      console.error('Board container not found');
      return;
    }

    this.render();
    this.attachEventListeners();
  }

  /**
   * Render entire board
   */
  render() {
    this.container.innerHTML = `
      <div class="board-header">
        <h2>Application Tracker</h2>
        <div class="board-actions">
          <input type="search" id="board-search" placeholder="Search applications..." class="board-search">
          <select id="board-filter-priority" class="board-filter">
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select id="board-filter-source" class="board-filter">
            <option value="">All Sources</option>
            <option value="linkedin">LinkedIn</option>
            <option value="indeed">Indeed</option>
            <option value="company-website">Company Website</option>
            <option value="referral">Referral</option>
            <option value="other">Other</option>
          </select>
          <button id="btn-add-application" class="btn btn-primary">
            <i class="fas fa-plus"></i> Add Application
          </button>
        </div>
      </div>
      <div class="board-columns" id="board-columns">
        ${this.renderColumns()}
      </div>
    `;

    this.renderAllCards();
  }

  /**
   * Render columns
   */
  renderColumns() {
    return this.BOARD_COLUMNS.map(column => `
      <div class="board-column" data-column-id="${column.id}">
        <div class="column-header" style="border-color: ${column.color}">
          <h3>${column.name}</h3>
          <span class="column-count" data-column="${column.id}">0</span>
        </div>
        <div class="column-cards" data-status="${column.id}">
          <!-- Cards will be inserted here -->
        </div>
      </div>
    `).join('');
  }

  /**
   * Render all cards in their respective columns
   */
  renderAllCards() {
    // Clear all columns
    document.querySelectorAll('.column-cards').forEach(col => {
      col.innerHTML = '';
    });

    // Get applications
    let applications = this.storage.getAll().filter(app => !app.archived);

    // Apply filters
    if (this.filters.search) {
      applications = this.storage.search(this.filters.search);
    }

    if (this.filters.priority || this.filters.source || this.filters.favorite || this.filters.tags.length > 0) {
      applications = this.storage.filter({
        priority: this.filters.priority,
        source: this.filters.source,
        favorite: this.filters.favorite,
        tags: this.filters.tags,
        archived: false
      });
    }

    // Render cards by status
    applications.forEach(app => {
      const column = document.querySelector(`.column-cards[data-status="${app.status}"]`);
      if (column) {
        column.innerHTML += this.renderCard(app);
      }
    });

    // Update column counts
    this.updateColumnCounts();
  }

  /**
   * Render single card
   */
  renderCard(app) {
    const daysSinceUpdate = this.getDaysSince(app.lastUpdated);
    const isOverdue = app.nextDeadline && new Date(app.nextDeadline) < new Date();
    const priorityClass = app.priority ? `priority-${app.priority}` : '';
    const favoriteClass = app.favorite ? 'favorite' : '';

    return `
      <div class="application-card ${priorityClass} ${favoriteClass}"
           draggable="true"
           data-app-id="${app.id}">
        <div class="card-header">
          <div class="card-company">
            ${this.getCompanyLogo(app.jobUrl)}
            <strong>${app.company}</strong>
          </div>
          <div class="card-actions">
            ${app.favorite ? '<i class="fas fa-star favorite-icon"></i>' : ''}
            ${app.priority === 'high' ? '<i class="fas fa-exclamation-circle priority-icon"></i>' : ''}
            ${isOverdue ? '<i class="fas fa-clock overdue-icon" title="Overdue deadline"></i>' : ''}
          </div>
        </div>
        <div class="card-role">${app.role}</div>
        ${app.location ? `<div class="card-location"><i class="fas fa-map-marker-alt"></i> ${app.location}</div>` : ''}
        ${app.salaryRange ? `<div class="card-salary"><i class="fas fa-dollar-sign"></i> ${this.formatSalary(app.salaryRange)}</div>` : ''}
        <div class="card-meta">
          ${app.appliedDate ? `<span><i class="fas fa-calendar"></i> Applied ${this.formatDate(app.appliedDate)}</span>` : ''}
          <span class="days-since"><i class="fas fa-clock"></i> ${daysSinceUpdate}d ago</span>
        </div>
        ${app.nextDeadline ? `
          <div class="card-deadline ${isOverdue ? 'overdue' : ''}">
            <i class="fas fa-bell"></i> ${isOverdue ? 'Overdue: ' : 'Due: '}${this.formatDate(app.nextDeadline)}
          </div>
        ` : ''}
        ${app.tags && app.tags.length > 0 ? `
          <div class="card-tags">
            ${app.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
        <div class="card-footer">
          <button class="btn-icon" onclick="kanbanBoard.viewApplication('${app.id}')" title="View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-icon" onclick="kanbanBoard.editApplication('${app.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon" onclick="kanbanBoard.archiveApplication('${app.id}')" title="Archive">
            <i class="fas fa-archive"></i>
          </button>
          <button class="btn-icon" onclick="kanbanBoard.deleteApplication('${app.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Search
    const searchInput = document.getElementById('board-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value;
        this.renderAllCards();
      });
    }

    // Priority filter
    const priorityFilter = document.getElementById('board-filter-priority');
    if (priorityFilter) {
      priorityFilter.addEventListener('change', (e) => {
        this.filters.priority = e.target.value || null;
        this.renderAllCards();
      });
    }

    // Source filter
    const sourceFilter = document.getElementById('board-filter-source');
    if (sourceFilter) {
      sourceFilter.addEventListener('change', (e) => {
        this.filters.source = e.target.value || null;
        this.renderAllCards();
      });
    }

    // Add application button
    const addBtn = document.getElementById('btn-add-application');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showAddApplicationForm());
    }

    // Drag and drop
    this.attachDragDropListeners();
  }

  /**
   * Attach drag and drop listeners
   */
  attachDragDropListeners() {
    // Delegated event listeners for cards
    document.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('application-card')) {
        this.draggedCard = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
      }
    });

    document.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('application-card')) {
        e.target.classList.remove('dragging');
        this.draggedCard = null;
      }
    });

    // Column drop zones
    document.querySelectorAll('.column-cards').forEach(column => {
      column.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        column.classList.add('drag-over');
      });

      column.addEventListener('dragleave', (e) => {
        column.classList.remove('drag-over');
      });

      column.addEventListener('drop', (e) => {
        e.preventDefault();
        column.classList.remove('drag-over');

        if (this.draggedCard) {
          const appId = this.draggedCard.dataset.appId;
          const newStatus = column.dataset.status;
          this.moveApplication(appId, newStatus);
        }
      });
    });
  }

  /**
   * Move application to new status
   */
  moveApplication(appId, newStatus) {
    const updates = { status: newStatus };

    // Set applied date if moving to 'applied' status
    if (newStatus === 'applied') {
      const app = this.storage.getById(appId);
      if (!app.appliedDate) {
        updates.appliedDate = new Date().toISOString();
      }
    }

    this.storage.update(appId, updates);
    this.renderAllCards();
    this.showNotification(`Application moved to ${newStatus}`);
  }

  /**
   * Update column counts
   */
  updateColumnCounts() {
    this.BOARD_COLUMNS.forEach(column => {
      const cards = document.querySelectorAll(`.column-cards[data-status="${column.id}"] .application-card`);
      const countEl = document.querySelector(`.column-count[data-column="${column.id}"]`);
      if (countEl) {
        countEl.textContent = cards.length;
      }
    });
  }

  /**
   * Show add application form
   */
  showAddApplicationForm() {
    const formHtml = `
      <div class="modal-overlay" id="app-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Add New Application</h3>
            <button class="btn-close" onclick="kanbanBoard.closeModal()">&times;</button>
          </div>
          <form id="application-form" class="modal-body">
            <div class="form-group">
              <label>Company *</label>
              <input type="text" name="company" required class="form-control">
            </div>
            <div class="form-group">
              <label>Role *</label>
              <input type="text" name="role" required class="form-control">
            </div>
            <div class="form-group">
              <label>Location</label>
              <input type="text" name="location" class="form-control">
            </div>
            <div class="form-group">
              <label>Job URL</label>
              <input type="url" name="jobUrl" class="form-control">
            </div>
            <div class="form-group">
              <label>Job Description</label>
              <textarea name="jobDescription" rows="4" class="form-control"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Salary Min</label>
                <input type="number" name="salaryMin" class="form-control">
              </div>
              <div class="form-group">
                <label>Salary Max</label>
                <input type="number" name="salaryMax" class="form-control">
              </div>
              <div class="form-group">
                <label>Currency</label>
                <select name="salaryCurrency" class="form-control">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Status *</label>
                <select name="status" required class="form-control">
                  ${this.BOARD_COLUMNS.map(col =>
                    `<option value="${col.id}">${col.name}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Priority</label>
                <select name="priority" class="form-control">
                  <option value="">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div class="form-group">
                <label>Source</label>
                <select name="source" class="form-control">
                  <option value="">Select source</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="indeed">Indeed</option>
                  <option value="company-website">Company Website</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Next Deadline</label>
              <input type="datetime-local" name="nextDeadline" class="form-control">
            </div>
            <div class="form-group">
              <label>Next Action</label>
              <input type="text" name="nextAction" class="form-control" placeholder="e.g., Follow up with recruiter">
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea name="notes" rows="3" class="form-control"></textarea>
            </div>
            <div class="form-group">
              <label>Tags (comma-separated)</label>
              <input type="text" name="tags" class="form-control" placeholder="remote, senior, startup">
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" name="favorite"> Mark as favorite
              </label>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="kanbanBoard.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Add Application</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHtml);

    // Attach form submit handler
    document.getElementById('application-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddApplication(e.target);
    });
  }

  /**
   * Handle add application form submission
   */
  handleAddApplication(form) {
    const formData = new FormData(form);
    const tags = formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()) : [];

    const applicationData = {
      company: formData.get('company'),
      role: formData.get('role'),
      location: formData.get('location') || '',
      jobUrl: formData.get('jobUrl') || '',
      jobDescription: formData.get('jobDescription') || '',
      salaryRange: {
        min: formData.get('salaryMin') ? parseInt(formData.get('salaryMin')) : null,
        max: formData.get('salaryMax') ? parseInt(formData.get('salaryMax')) : null,
        currency: formData.get('salaryCurrency') || 'USD'
      },
      status: formData.get('status'),
      priority: formData.get('priority') || null,
      source: formData.get('source') || null,
      nextDeadline: formData.get('nextDeadline') || null,
      nextAction: formData.get('nextAction') || '',
      notes: formData.get('notes') || '',
      tags: tags,
      favorite: formData.get('favorite') === 'on',
      appliedDate: formData.get('status') === 'applied' ? new Date().toISOString() : null
    };

    this.storage.create(applicationData);
    this.closeModal();
    this.renderAllCards();
    this.showNotification('Application added successfully');
  }

  /**
   * View application details
   */
  viewApplication(appId) {
    const app = this.storage.getById(appId);
    if (!app) return;

    // Trigger custom event that can be handled by the test page
    const event = new CustomEvent('viewApplication', { detail: app });
    document.dispatchEvent(event);
  }

  /**
   * Edit application
   */
  editApplication(appId) {
    const app = this.storage.getById(appId);
    if (!app) return;

    // Trigger custom event
    const event = new CustomEvent('editApplication', { detail: app });
    document.dispatchEvent(event);
  }

  /**
   * Archive application
   */
  archiveApplication(appId) {
    if (confirm('Archive this application?')) {
      this.storage.archive(appId);
      this.renderAllCards();
      this.showNotification('Application archived');
    }
  }

  /**
   * Delete application
   */
  deleteApplication(appId) {
    if (confirm('Delete this application? This cannot be undone.')) {
      this.storage.delete(appId);
      this.renderAllCards();
      this.showNotification('Application deleted');
    }
  }

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.getElementById('app-modal');
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Show notification
   */
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Helper: Get company logo from URL
   */
  getCompanyLogo(url) {
    if (!url) return '<i class="fas fa-building"></i>';
    try {
      const domain = new URL(url).hostname;
      return `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=32" alt="Logo" class="company-logo" onerror="this.style.display='none'">`;
    } catch {
      return '<i class="fas fa-building"></i>';
    }
  }

  /**
   * Helper: Format salary range
   */
  formatSalary(range) {
    if (!range || (!range.min && !range.max)) return '';
    const currency = range.currency || 'USD';
    const min = range.min ? `${currency} ${range.min.toLocaleString()}` : '';
    const max = range.max ? `${currency} ${range.max.toLocaleString()}` : '';
    if (min && max) return `${min} - ${max}`;
    return min || max;
  }

  /**
   * Helper: Format date
   */
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /**
   * Helper: Get days since date
   */
  getDaysSince(dateString) {
    if (!dateString) return 0;
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

// Make globally accessible
let kanbanBoard;
