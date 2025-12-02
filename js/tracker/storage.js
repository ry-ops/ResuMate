/**
 * Application Tracker Storage Module
 * Handles localStorage persistence for application data
 */

class TrackerStorage {
  constructor() {
    this.STORAGE_KEY = 'resumate_applications';
    this.VERSION_KEY = 'resumate_tracker_version';
    this.CURRENT_VERSION = '1.0.0';
    this.init();
  }

  /**
   * Initialize storage
   */
  init() {
    const version = localStorage.getItem(this.VERSION_KEY);
    if (version !== this.CURRENT_VERSION) {
      this.migrate(version);
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
    }
  }

  /**
   * Migrate data from older versions
   */
  migrate(fromVersion) {
    if (!fromVersion) {
      // First time initialization
      console.log('Initializing tracker storage');
      return;
    }
    // Add migration logic here for future versions
    console.log(`Migrating from version ${fromVersion} to ${this.CURRENT_VERSION}`);
  }

  /**
   * Get all applications
   */
  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading applications:', error);
      return [];
    }
  }

  /**
   * Get application by ID
   */
  getById(id) {
    const applications = this.getAll();
    return applications.find(app => app.id === id);
  }

  /**
   * Save all applications
   */
  saveAll(applications) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(applications));
      return true;
    } catch (error) {
      console.error('Error saving applications:', error);
      return false;
    }
  }

  /**
   * Create new application
   */
  create(applicationData) {
    const applications = this.getAll();
    const newApplication = {
      id: this.generateId(),
      ...applicationData,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      timeline: applicationData.timeline || [],
      contacts: applicationData.contacts || [],
      pros: applicationData.pros || [],
      cons: applicationData.cons || [],
      tags: applicationData.tags || [],
      favorite: applicationData.favorite || false,
      archived: applicationData.archived || false
    };

    applications.push(newApplication);
    this.saveAll(applications);

    // Add timeline event
    this.addTimelineEvent(newApplication.id, 'Application created', '');

    return newApplication;
  }

  /**
   * Update existing application
   */
  update(id, updates) {
    const applications = this.getAll();
    const index = applications.findIndex(app => app.id === id);

    if (index === -1) {
      console.error(`Application ${id} not found`);
      return null;
    }

    const oldStatus = applications[index].status;
    const newStatus = updates.status;

    applications[index] = {
      ...applications[index],
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    this.saveAll(applications);

    // Add timeline event if status changed
    if (oldStatus !== newStatus && newStatus) {
      this.addTimelineEvent(id, `Status changed to ${newStatus}`, '');
    }

    return applications[index];
  }

  /**
   * Delete application
   */
  delete(id) {
    const applications = this.getAll();
    const filtered = applications.filter(app => app.id !== id);

    if (filtered.length === applications.length) {
      console.error(`Application ${id} not found`);
      return false;
    }

    this.saveAll(filtered);
    return true;
  }

  /**
   * Archive application
   */
  archive(id) {
    return this.update(id, { archived: true });
  }

  /**
   * Unarchive application
   */
  unarchive(id) {
    return this.update(id, { archived: false });
  }

  /**
   * Get applications by status
   */
  getByStatus(status) {
    return this.getAll().filter(app => app.status === status && !app.archived);
  }

  /**
   * Get archived applications
   */
  getArchived() {
    return this.getAll().filter(app => app.archived);
  }

  /**
   * Search applications
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(app => {
      return (
        app.company.toLowerCase().includes(lowerQuery) ||
        app.role.toLowerCase().includes(lowerQuery) ||
        app.location.toLowerCase().includes(lowerQuery) ||
        (app.notes && app.notes.toLowerCase().includes(lowerQuery)) ||
        (app.tags && app.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );
    });
  }

  /**
   * Filter applications
   */
  filter(criteria) {
    let applications = this.getAll();

    if (criteria.status) {
      applications = applications.filter(app => app.status === criteria.status);
    }

    if (criteria.priority) {
      applications = applications.filter(app => app.priority === criteria.priority);
    }

    if (criteria.favorite !== undefined) {
      applications = applications.filter(app => app.favorite === criteria.favorite);
    }

    if (criteria.archived !== undefined) {
      applications = applications.filter(app => app.archived === criteria.archived);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      applications = applications.filter(app =>
        app.tags.some(tag => criteria.tags.includes(tag))
      );
    }

    if (criteria.source) {
      applications = applications.filter(app => app.source === criteria.source);
    }

    return applications;
  }

  /**
   * Add timeline event
   */
  addTimelineEvent(id, event, notes) {
    const application = this.getById(id);
    if (!application) return null;

    application.timeline.push({
      date: new Date().toISOString(),
      event,
      notes
    });

    return this.update(id, { timeline: application.timeline });
  }

  /**
   * Add contact
   */
  addContact(id, contact) {
    const application = this.getById(id);
    if (!application) return null;

    application.contacts.push(contact);
    return this.update(id, { contacts: application.contacts });
  }

  /**
   * Remove contact
   */
  removeContact(id, contactIndex) {
    const application = this.getById(id);
    if (!application) return null;

    application.contacts.splice(contactIndex, 1);
    return this.update(id, { contacts: application.contacts });
  }

  /**
   * Get upcoming deadlines
   */
  getUpcomingDeadlines(days = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.getAll()
      .filter(app => {
        if (!app.nextDeadline || app.archived) return false;
        const deadline = new Date(app.nextDeadline);
        return deadline >= now && deadline <= futureDate;
      })
      .sort((a, b) => new Date(a.nextDeadline) - new Date(b.nextDeadline));
  }

  /**
   * Get overdue tasks
   */
  getOverdue() {
    const now = new Date();
    return this.getAll()
      .filter(app => {
        if (!app.nextDeadline || app.archived) return false;
        const deadline = new Date(app.nextDeadline);
        return deadline < now;
      })
      .sort((a, b) => new Date(a.nextDeadline) - new Date(b.nextDeadline));
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Clear all data (use with caution!)
   */
  clearAll() {
    localStorage.removeItem(this.STORAGE_KEY);
    return true;
  }

  /**
   * Export all data
   */
  exportData() {
    return {
      version: this.CURRENT_VERSION,
      exportDate: new Date().toISOString(),
      applications: this.getAll()
    };
  }

  /**
   * Import data
   */
  importData(data) {
    try {
      if (!data.applications || !Array.isArray(data.applications)) {
        throw new Error('Invalid import data format');
      }

      this.saveAll(data.applications);
      return { success: true, count: data.applications.length };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const trackerStorage = new TrackerStorage();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrackerStorage;
}
