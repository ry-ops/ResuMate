/**
 * Application Tracker Analytics
 * Calculates statistics, trends, and visualizations
 */

class TrackerAnalytics {
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Get all statistics
   */
  getAllStats() {
    const applications = this.storage.getAll().filter(app => !app.archived);

    return {
      overview: this.getOverviewStats(applications),
      byStatus: this.getStatusStats(applications),
      rates: this.getRates(applications),
      timing: this.getTimingStats(applications),
      trends: this.getMonthlyTrends(applications),
      sources: this.getSourceStats(applications),
      priorities: this.getPriorityStats(applications)
    };
  }

  /**
   * Get overview statistics
   */
  getOverviewStats(applications) {
    const total = applications.length;
    const active = applications.filter(app =>
      !['rejected', 'withdrawn', 'offer'].includes(app.status)
    ).length;
    const successful = applications.filter(app => app.status === 'offer').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const favorites = applications.filter(app => app.favorite).length;

    return {
      total,
      active,
      successful,
      rejected,
      favorites
    };
  }

  /**
   * Get statistics by status
   */
  getStatusStats(applications) {
    const statuses = {
      saved: 0,
      preparing: 0,
      applied: 0,
      'phone-screen': 0,
      interview: 0,
      'final-round': 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0
    };

    applications.forEach(app => {
      if (statuses.hasOwnProperty(app.status)) {
        statuses[app.status]++;
      }
    });

    return statuses;
  }

  /**
   * Calculate conversion rates
   */
  getRates(applications) {
    const applied = applications.filter(app => {
      return ['applied', 'phone-screen', 'interview', 'final-round', 'offer', 'rejected'].includes(app.status);
    });

    const total = applied.length;
    if (total === 0) {
      return {
        responseRate: 0,
        phoneScreenRate: 0,
        interviewRate: 0,
        finalRoundRate: 0,
        offerRate: 0,
        successRate: 0
      };
    }

    const responded = applications.filter(app =>
      ['phone-screen', 'interview', 'final-round', 'offer'].includes(app.status)
    ).length;

    const phoneScreen = applications.filter(app =>
      ['phone-screen', 'interview', 'final-round', 'offer'].includes(app.status)
    ).length;

    const interview = applications.filter(app =>
      ['interview', 'final-round', 'offer'].includes(app.status)
    ).length;

    const finalRound = applications.filter(app =>
      ['final-round', 'offer'].includes(app.status)
    ).length;

    const offers = applications.filter(app => app.status === 'offer').length;

    return {
      responseRate: this.calculatePercentage(responded, total),
      phoneScreenRate: this.calculatePercentage(phoneScreen, total),
      interviewRate: this.calculatePercentage(interview, total),
      finalRoundRate: this.calculatePercentage(finalRound, total),
      offerRate: this.calculatePercentage(offers, total),
      successRate: this.calculatePercentage(offers, total)
    };
  }

  /**
   * Calculate timing statistics
   */
  getTimingStats(applications) {
    const applied = applications.filter(app => app.appliedDate);

    if (applied.length === 0) {
      return {
        avgTimeToResponse: 0,
        avgTimeToInterview: 0,
        avgTimeToOffer: 0,
        avgDaysSinceUpdate: 0
      };
    }

    // Time to response (first follow-up activity)
    const responseTimes = [];
    applied.forEach(app => {
      if (['phone-screen', 'interview', 'final-round', 'offer'].includes(app.status)) {
        const applied = new Date(app.appliedDate);
        const updated = new Date(app.lastUpdated);
        const days = Math.floor((updated - applied) / (1000 * 60 * 60 * 24));
        responseTimes.push(days);
      }
    });

    // Time to interview
    const interviewTimes = [];
    applied.forEach(app => {
      if (['interview', 'final-round', 'offer'].includes(app.status)) {
        const applied = new Date(app.appliedDate);
        const updated = new Date(app.lastUpdated);
        const days = Math.floor((updated - applied) / (1000 * 60 * 60 * 24));
        interviewTimes.push(days);
      }
    });

    // Time to offer
    const offerTimes = [];
    applied.forEach(app => {
      if (app.status === 'offer') {
        const applied = new Date(app.appliedDate);
        const updated = new Date(app.lastUpdated);
        const days = Math.floor((updated - applied) / (1000 * 60 * 60 * 24));
        offerTimes.push(days);
      }
    });

    // Days since last update
    const now = new Date();
    const daysSinceUpdate = applications.map(app => {
      const updated = new Date(app.lastUpdated);
      return Math.floor((now - updated) / (1000 * 60 * 60 * 24));
    });

    return {
      avgTimeToResponse: this.calculateAverage(responseTimes),
      avgTimeToInterview: this.calculateAverage(interviewTimes),
      avgTimeToOffer: this.calculateAverage(offerTimes),
      avgDaysSinceUpdate: this.calculateAverage(daysSinceUpdate)
    };
  }

  /**
   * Get monthly trends
   */
  getMonthlyTrends(applications) {
    const trends = {};
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = this.getMonthKey(date);
      trends[key] = {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        applied: 0,
        interviews: 0,
        offers: 0,
        rejections: 0
      };
    }

    // Count applications by month
    applications.forEach(app => {
      if (app.appliedDate) {
        const date = new Date(app.appliedDate);
        if (date >= sixMonthsAgo) {
          const key = this.getMonthKey(date);
          if (trends[key]) {
            trends[key].applied++;

            if (['interview', 'final-round', 'offer'].includes(app.status)) {
              trends[key].interviews++;
            }
            if (app.status === 'offer') {
              trends[key].offers++;
            }
            if (app.status === 'rejected') {
              trends[key].rejections++;
            }
          }
        }
      }
    });

    return Object.values(trends).reverse();
  }

  /**
   * Get source statistics
   */
  getSourceStats(applications) {
    const sources = {};

    applications.forEach(app => {
      const source = app.source || 'unknown';
      if (!sources[source]) {
        sources[source] = {
          count: 0,
          offers: 0,
          rejections: 0
        };
      }
      sources[source].count++;
      if (app.status === 'offer') sources[source].offers++;
      if (app.status === 'rejected') sources[source].rejections++;
    });

    return Object.entries(sources)
      .map(([source, stats]) => ({
        source,
        ...stats,
        successRate: this.calculatePercentage(stats.offers, stats.count)
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get priority statistics
   */
  getPriorityStats(applications) {
    const priorities = {
      high: { count: 0, offers: 0 },
      medium: { count: 0, offers: 0 },
      low: { count: 0, offers: 0 },
      none: { count: 0, offers: 0 }
    };

    applications.forEach(app => {
      const priority = app.priority || 'none';
      priorities[priority].count++;
      if (app.status === 'offer') {
        priorities[priority].offers++;
      }
    });

    return priorities;
  }

  /**
   * Render analytics dashboard
   */
  renderDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stats = this.getAllStats();

    container.innerHTML = `
      <div class="analytics-dashboard">
        <h2>Application Analytics</h2>

        <!-- Overview Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${stats.overview.total}</div>
            <div class="stat-label">Total Applications</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.overview.active}</div>
            <div class="stat-label">Active</div>
          </div>
          <div class="stat-card success">
            <div class="stat-value">${stats.overview.successful}</div>
            <div class="stat-label">Offers</div>
          </div>
          <div class="stat-card danger">
            <div class="stat-value">${stats.overview.rejected}</div>
            <div class="stat-label">Rejected</div>
          </div>
        </div>

        <!-- Conversion Rates -->
        <div class="analytics-section">
          <h3>Conversion Rates</h3>
          <div class="rates-grid">
            <div class="rate-item">
              <div class="rate-bar">
                <div class="rate-fill" style="width: ${stats.rates.responseRate}%"></div>
              </div>
              <div class="rate-label">Response Rate: ${stats.rates.responseRate}%</div>
            </div>
            <div class="rate-item">
              <div class="rate-bar">
                <div class="rate-fill" style="width: ${stats.rates.phoneScreenRate}%"></div>
              </div>
              <div class="rate-label">Phone Screen Rate: ${stats.rates.phoneScreenRate}%</div>
            </div>
            <div class="rate-item">
              <div class="rate-bar">
                <div class="rate-fill" style="width: ${stats.rates.interviewRate}%"></div>
              </div>
              <div class="rate-label">Interview Rate: ${stats.rates.interviewRate}%</div>
            </div>
            <div class="rate-item">
              <div class="rate-bar">
                <div class="rate-fill" style="width: ${stats.rates.offerRate}%"></div>
              </div>
              <div class="rate-label">Offer Rate: ${stats.rates.offerRate}%</div>
            </div>
          </div>
        </div>

        <!-- Timing Statistics -->
        <div class="analytics-section">
          <h3>Average Timing</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${stats.timing.avgTimeToResponse}</div>
              <div class="stat-label">Days to Response</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.timing.avgTimeToInterview}</div>
              <div class="stat-label">Days to Interview</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.timing.avgTimeToOffer}</div>
              <div class="stat-label">Days to Offer</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.timing.avgDaysSinceUpdate}</div>
              <div class="stat-label">Days Since Update</div>
            </div>
          </div>
        </div>

        <!-- Status Breakdown -->
        <div class="analytics-section">
          <h3>Applications by Status</h3>
          <div class="status-chart">
            ${this.renderStatusChart(stats.byStatus)}
          </div>
        </div>

        <!-- Monthly Trends -->
        <div class="analytics-section">
          <h3>Monthly Trends (Last 6 Months)</h3>
          <div class="trends-chart">
            ${this.renderTrendsChart(stats.trends)}
          </div>
        </div>

        <!-- Source Performance -->
        <div class="analytics-section">
          <h3>Performance by Source</h3>
          <table class="analytics-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Applications</th>
                <th>Offers</th>
                <th>Rejections</th>
                <th>Success Rate</th>
              </tr>
            </thead>
            <tbody>
              ${stats.sources.map(s => `
                <tr>
                  <td><strong>${this.formatSourceName(s.source)}</strong></td>
                  <td>${s.count}</td>
                  <td class="success">${s.offers}</td>
                  <td class="danger">${s.rejections}</td>
                  <td>${s.successRate}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Render status chart
   */
  renderStatusChart(byStatus) {
    const total = Object.values(byStatus).reduce((sum, count) => sum + count, 0);
    if (total === 0) return '<p>No data available</p>';

    const statusLabels = {
      saved: 'Saved',
      preparing: 'Preparing',
      applied: 'Applied',
      'phone-screen': 'Phone Screen',
      interview: 'Interview',
      'final-round': 'Final Round',
      offer: 'Offer',
      rejected: 'Rejected',
      withdrawn: 'Withdrawn'
    };

    return Object.entries(byStatus)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => {
        const percentage = this.calculatePercentage(count, total);
        return `
          <div class="status-bar-item">
            <div class="status-bar-label">${statusLabels[status]}: ${count} (${percentage}%)</div>
            <div class="status-bar">
              <div class="status-bar-fill status-${status}" style="width: ${percentage}%"></div>
            </div>
          </div>
        `;
      }).join('');
  }

  /**
   * Render trends chart (simple bar chart)
   */
  renderTrendsChart(trends) {
    if (trends.length === 0) return '<p>No data available</p>';

    const maxValue = Math.max(...trends.map(t => Math.max(t.applied, t.interviews, t.offers)));
    if (maxValue === 0) return '<p>No data available</p>';

    return `
      <div class="trends-chart-container">
        ${trends.map(trend => `
          <div class="trend-month">
            <div class="trend-bars">
              <div class="trend-bar applied" style="height: ${(trend.applied / maxValue) * 100}%"
                   title="${trend.applied} applied"></div>
              <div class="trend-bar interviews" style="height: ${(trend.interviews / maxValue) * 100}%"
                   title="${trend.interviews} interviews"></div>
              <div class="trend-bar offers" style="height: ${(trend.offers / maxValue) * 100}%"
                   title="${trend.offers} offers"></div>
            </div>
            <div class="trend-label">${trend.month}</div>
            <div class="trend-values">
              <small>${trend.applied}/${trend.interviews}/${trend.offers}</small>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="trends-legend">
        <span><span class="legend-color applied"></span> Applied</span>
        <span><span class="legend-color interviews"></span> Interviews</span>
        <span><span class="legend-color offers"></span> Offers</span>
      </div>
    `;
  }

  /**
   * Helper: Calculate percentage
   */
  calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  /**
   * Helper: Calculate average
   */
  calculateAverage(values) {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  }

  /**
   * Helper: Get month key
   */
  getMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Helper: Format source name
   */
  formatSourceName(source) {
    const names = {
      linkedin: 'LinkedIn',
      indeed: 'Indeed',
      'company-website': 'Company Website',
      referral: 'Referral',
      other: 'Other',
      unknown: 'Unknown'
    };
    return names[source] || source;
  }
}

// Make globally accessible
let trackerAnalytics;
