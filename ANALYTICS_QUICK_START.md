# Analytics Dashboard - Quick Start Guide

## 1. Open the Dashboard

Navigate to: `/Users/ryandahlberg/Projects/cortex/ATSFlow/analytics-dashboard.html`

Or open in browser:
```bash
open analytics-dashboard.html
```

## 2. First Time Setup

The dashboard will initialize automatically with empty data. To populate it:

### Option A: Generate Sample Data

Open browser console and run:

```javascript
// Create sample analytics data
const analytics = new TrackerAnalytics();

// Track some sample scores
for (let i = 0; i < 10; i++) {
  const score = 70 + Math.random() * 20;
  analytics.trackResumeScore(
    Math.round(score),
    Math.round(score + 5),
    ['classic', 'modern', 'professional'][i % 3],
    ['JavaScript', 'React', 'Node.js', 'Python', 'AWS']
  );
}

// Refresh the page
location.reload();
```

### Option B: Use Real Data

1. Go to ATS Scanner page
2. Run a scan on your resume
3. The score will automatically be tracked
4. Return to analytics dashboard to see results

## 3. Key Features

### Date Range Filtering
Click the buttons at the top:
- **7 Days** - Last week
- **30 Days** - Last month (default)
- **90 Days** - Last quarter
- **1 Year** - Annual view
- **All Time** - Everything

### Dark Mode
Click the moon icon (🌙) in the top right to toggle dark mode.

### Export Reports
1. Click **Export** button
2. Select format (PDF or CSV)
3. Click **Export**

### Refresh Data
Click the **Refresh** button to reload all charts and metrics.

## 4. Understanding the Charts

### Score Progression
- **Blue line** = ATS Score
- **Green line** = Polish Score
- Shows improvement over time

### Application Funnel
- Shows conversion rates through hiring stages
- Wider bars = more applications at that stage

### Template Usage
- Pie chart showing which templates you use most
- Hover to see percentages

### Keywords
- Bar chart of most mentioned skills
- 📈 = Trending up (use more!)
- 📉 = Trending down (may be overused)
- ➡️ = Stable

### Monthly Trends
- Applications, Interviews, and Offers over 6 months
- Helps identify seasonal patterns

## 5. Key Metrics Explained

### Current ATS Score
Your most recent resume score. Higher is better!
- 90-100%: Excellent
- 80-89%: Very Good
- 70-79%: Good
- Below 70%: Needs Work

### Response Rate
Percentage of applications that received a response.
- Industry average: ~15%
- Good: 20%+
- Excellent: 30%+

### Application ROI
Efficiency of your job search efforts.
- Excellent: 30+
- Good: 20-30
- Fair: 10-20
- Needs Improvement: <10

### Activity Level
How often you're updating your resume.
- High: 3+ updates per week
- Medium: 1-3 updates per week
- Low: <1 update per week

## 6. Troubleshooting

### No Data Showing
**Solution**: Track some resume scores first. Go to ATS Scanner and run a scan.

### Charts Not Rendering
**Solution**: Make sure Chart.js loaded. Check browser console for errors.

### Dark Mode Not Saving
**Solution**: Enable localStorage in your browser settings.

### Export Not Working
**Solution**:
- For PDF: Use browser print dialog
- For CSV: Check download folder for file

## 7. Integration with Other Tools

### ATS Scanner
After scanning your resume, the score is automatically tracked in analytics.

### Export Engine
Every time you export a resume, it's logged in the analytics.

### Application Tracker
Application data feeds into the analytics for conversion tracking.

### Version Manager
Compare different resume versions to see which performs better.

## 8. Best Practices

### Regular Tracking
- Scan your resume after each update
- Track at least once per week

### Template Testing
- Try different templates
- Compare performance in Template Performance table

### Keyword Optimization
- Focus on top-performing keywords
- Reduce overused keywords

### Set Goals
- Track improvement over time
- Aim for steady ATS score increases

## 9. Next Steps

Once you have data populated:

1. **Analyze Trends** - Look at Score Progression chart
2. **Optimize Templates** - Check Template Performance table
3. **Improve Keywords** - Review Keyword Effectiveness table
4. **Track ROI** - Monitor Application ROI metric
5. **Export Reports** - Download monthly CSV backups

## 10. File Locations

All analytics files are located in:
```
/Users/ryandahlberg/Projects/cortex/ATSFlow/

Main Dashboard:
  analytics-dashboard.html

JavaScript:
  js/tracker/analytics.js (Enhanced engine)
  js/tracker/charts.js    (Visualizations)
  js/tracker/metrics.js   (Calculations)

Styles:
  css/analytics.css

Documentation:
  ANALYTICS_README.md (Full guide)
  ANALYTICS_VISUAL_GUIDE.txt (Visual examples)
  WORKER_17_COMPLETION_REPORT.md (Implementation details)
```

## 11. Quick Commands

Open dashboard:
```bash
cd /Users/ryandahlberg/Projects/cortex/ATSFlow
open analytics-dashboard.html
```

Clear analytics data (if needed):
```javascript
localStorage.removeItem('resumate_analytics_v1');
location.reload();
```

Export current data:
```javascript
const data = localStorage.getItem('resumate_analytics_v1');
console.log(JSON.parse(data));
```

## Need Help?

See full documentation: `ANALYTICS_README.md`
Visual guide: `ANALYTICS_VISUAL_GUIDE.txt`
Implementation details: `WORKER_17_COMPLETION_REPORT.md`

---

**Happy Analyzing!** 📊
