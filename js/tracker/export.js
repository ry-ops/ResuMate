/**
 * Application Tracker Export Module
 * Handles CSV, JSON, and Excel-compatible exports
 */

class TrackerExport {
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Export to CSV
   */
  exportToCSV(applications = null) {
    const apps = applications || this.storage.getAll();

    if (apps.length === 0) {
      alert('No applications to export');
      return;
    }

    // CSV headers
    const headers = [
      'Company',
      'Role',
      'Location',
      'Status',
      'Priority',
      'Source',
      'Applied Date',
      'Last Updated',
      'Next Deadline',
      'Next Action',
      'Job URL',
      'Salary Range',
      'Tags',
      'Notes',
      'Favorite',
      'Archived'
    ];

    // Convert applications to CSV rows
    const rows = apps.map(app => [
      this.escapeCSV(app.company),
      this.escapeCSV(app.role),
      this.escapeCSV(app.location || ''),
      this.escapeCSV(app.status),
      this.escapeCSV(app.priority || ''),
      this.escapeCSV(app.source || ''),
      this.formatDateForExport(app.appliedDate),
      this.formatDateForExport(app.lastUpdated),
      this.formatDateForExport(app.nextDeadline),
      this.escapeCSV(app.nextAction || ''),
      this.escapeCSV(app.jobUrl || ''),
      this.formatSalaryForExport(app.salaryRange),
      this.escapeCSV((app.tags || []).join(', ')),
      this.escapeCSV(app.notes || ''),
      app.favorite ? 'Yes' : 'No',
      app.archived ? 'Yes' : 'No'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download file
    this.downloadFile(csvContent, 'application-tracker.csv', 'text/csv');
  }

  /**
   * Export to JSON
   */
  exportToJSON(applications = null) {
    const apps = applications || this.storage.getAll();

    if (apps.length === 0) {
      alert('No applications to export');
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      count: apps.length,
      applications: apps
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonContent, 'application-tracker.json', 'application/json');
  }

  /**
   * Export to Excel-compatible CSV
   */
  exportToExcel(applications = null) {
    const apps = applications || this.storage.getAll();

    if (apps.length === 0) {
      alert('No applications to export');
      return;
    }

    // Extended headers for Excel
    const headers = [
      'Company',
      'Role',
      'Location',
      'Status',
      'Priority',
      'Source',
      'Applied Date',
      'Last Updated',
      'Days Since Applied',
      'Days Since Update',
      'Next Deadline',
      'Days Until Deadline',
      'Next Action',
      'Job URL',
      'Salary Min',
      'Salary Max',
      'Currency',
      'Tags',
      'Contacts',
      'Timeline Events',
      'Notes',
      'Interview Notes',
      'Pros',
      'Cons',
      'Favorite',
      'Archived'
    ];

    const now = new Date();

    // Convert applications to Excel rows
    const rows = apps.map(app => {
      const appliedDate = app.appliedDate ? new Date(app.appliedDate) : null;
      const lastUpdate = new Date(app.lastUpdated);
      const deadline = app.nextDeadline ? new Date(app.nextDeadline) : null;

      return [
        this.escapeCSV(app.company),
        this.escapeCSV(app.role),
        this.escapeCSV(app.location || ''),
        this.escapeCSV(app.status),
        this.escapeCSV(app.priority || ''),
        this.escapeCSV(app.source || ''),
        this.formatDateForExport(app.appliedDate),
        this.formatDateForExport(app.lastUpdated),
        appliedDate ? this.daysBetween(appliedDate, now) : '',
        this.daysBetween(lastUpdate, now),
        this.formatDateForExport(app.nextDeadline),
        deadline ? this.daysBetween(now, deadline) : '',
        this.escapeCSV(app.nextAction || ''),
        this.escapeCSV(app.jobUrl || ''),
        app.salaryRange?.min || '',
        app.salaryRange?.max || '',
        app.salaryRange?.currency || '',
        this.escapeCSV((app.tags || []).join(', ')),
        this.escapeCSV((app.contacts || []).map(c => c.name).join('; ')),
        this.escapeCSV((app.timeline || []).length.toString()),
        this.escapeCSV(app.notes || ''),
        this.escapeCSV(app.interviewNotes || ''),
        this.escapeCSV((app.pros || []).join('; ')),
        this.escapeCSV((app.cons || []).join('; ')),
        app.favorite ? 'Yes' : 'No',
        app.archived ? 'Yes' : 'No'
      ];
    });

    // Add UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    this.downloadFile(csvContent, 'application-tracker-excel.csv', 'text/csv;charset=utf-8');
  }

  /**
   * Export filtered applications
   */
  exportFiltered(criteria) {
    const applications = this.storage.filter(criteria);
    this.exportToCSV(applications);
  }

  /**
   * Export by status
   */
  exportByStatus(status) {
    const applications = this.storage.getByStatus(status);
    this.exportToCSV(applications);
  }

  /**
   * Export analytics summary
   */
  exportAnalyticsSummary() {
    const analytics = new TrackerAnalytics(this.storage);
    const stats = analytics.getAllStats();

    const summary = {
      generatedAt: new Date().toISOString(),
      overview: stats.overview,
      conversionRates: stats.rates,
      averageTiming: stats.timing,
      monthlyTrends: stats.trends,
      sourcePerformance: stats.sources,
      statusBreakdown: stats.byStatus
    };

    const jsonContent = JSON.stringify(summary, null, 2);
    this.downloadFile(jsonContent, 'application-analytics.json', 'application/json');
  }

  /**
   * Import from JSON
   */
  importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const result = this.storage.importData(data);

          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error));
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Export to iCal format for deadlines
   */
  exportDeadlinesToICal() {
    const apps = this.storage.getAll().filter(app => app.nextDeadline && !app.archived);

    if (apps.length === 0) {
      alert('No upcoming deadlines to export');
      return;
    }

    const icalEvents = apps.map(app => {
      const deadline = new Date(app.nextDeadline);
      const dtstart = this.formatICalDate(deadline);
      const dtend = this.formatICalDate(new Date(deadline.getTime() + 3600000)); // +1 hour

      return [
        'BEGIN:VEVENT',
        `UID:${app.id}@resumate`,
        `DTSTAMP:${this.formatICalDate(new Date())}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${app.company} - ${app.role}`,
        `DESCRIPTION:${app.nextAction || 'Application deadline'}`,
        `LOCATION:${app.location || ''}`,
        `STATUS:CONFIRMED`,
        'END:VEVENT'
      ].join('\r\n');
    });

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ResuMate//Application Tracker//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...icalEvents,
      'END:VCALENDAR'
    ].join('\r\n');

    this.downloadFile(icalContent, 'application-deadlines.ics', 'text/calendar');
  }

  /**
   * Print application list
   */
  printApplicationList(applications = null) {
    const apps = applications || this.storage.getAll().filter(app => !app.archived);

    if (apps.length === 0) {
      alert('No applications to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Application Tracker - Print</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 1000px;
            margin: 0 auto;
          }
          h1 {
            text-align: center;
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f4f4f4;
            font-weight: bold;
          }
          .status {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          .priority-high { color: #dc2626; }
          .priority-medium { color: #f59e0b; }
          .priority-low { color: #10b981; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Application Tracker</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <button class="no-print" onclick="window.print()">Print</button>
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Applied</th>
              <th>Next Action</th>
            </tr>
          </thead>
          <tbody>
            ${apps.map(app => `
              <tr>
                <td><strong>${app.company}</strong></td>
                <td>${app.role}</td>
                <td><span class="status">${app.status}</span></td>
                <td class="priority-${app.priority || 'none'}">${app.priority || '-'}</td>
                <td>${this.formatDateForExport(app.appliedDate) || '-'}</td>
                <td>${app.nextAction || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  /**
   * Helper: Escape CSV values
   */
  escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * Helper: Format date for export
   */
  formatDateForExport(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Helper: Format salary for export
   */
  formatSalaryForExport(range) {
    if (!range || (!range.min && !range.max)) return '';
    const currency = range.currency || 'USD';
    const min = range.min || '';
    const max = range.max || '';
    if (min && max) return `${currency} ${min}-${max}`;
    return min || max ? `${currency} ${min || max}` : '';
  }

  /**
   * Helper: Calculate days between dates
   */
  daysBetween(date1, date2) {
    const diff = date2 - date1;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Helper: Format date for iCal
   */
  formatICalDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /**
   * Helper: Download file
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Make globally accessible
let trackerExport;
