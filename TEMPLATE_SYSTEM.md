# ATSFlow Template System Documentation

## Overview

The ATSFlow template system provides a flexible, ATS-compatible resume templating engine with three professional templates and extensive customization options.

## Architecture

### Components

1. **Template Engine** (`js/templates/engine.js`)
   - Core template loading and switching
   - CSS injection and management
   - Template state persistence
   - Event system for template changes

2. **Template Registry** (`js/templates/registry.js`)
   - Template catalog with metadata
   - Template discovery and categorization
   - Template comparison and validation
   - Industry-specific recommendations

3. **Style Customizer** (`js/templates/customizer.js`)
   - Color customization with presets
   - Typography controls
   - Spacing adjustments
   - Page size configuration

### Templates

#### 1. Classic Professional (`css/templates/classic.css`)

**ATS Score:** 100/100

**Features:**
- Single-column layout
- Conservative styling
- Traditional serif fonts (Georgia, Times New Roman)
- Black and white color scheme
- Maximum ATS compatibility

**Best For:**
- Corporate environments
- Finance and Banking
- Legal professions
- Healthcare
- Government positions

**Characteristics:**
- No graphics or icons
- Simple, parseable structure
- Text-only formatting
- Clean section breaks

#### 2. Modern Professional (`css/templates/modern.css`)

**ATS Score:** 95/100

**Features:**
- Single-column layout with visual accents
- Clean sans-serif fonts (Helvetica Neue, Arial)
- Subtle color scheme (blue and teal)
- Timeline-style experience section
- Icon support for contact information

**Best For:**
- Technology sector
- Marketing and Communications
- Design roles
- Startups
- Creative industries

**Characteristics:**
- Gradient header
- Color-coded sections
- Modern typography
- Visual hierarchy with colors

#### 3. Creative Professional (`css/templates/creative.css`)

**ATS Score:** 85/100

**Features:**
- Two-column layout (35% sidebar, 65% main)
- Mixed fonts (Montserrat headings, Open Sans body)
- Vibrant color scheme (navy, red, orange)
- Sidebar for skills and certifications
- Visual elements and graphics

**Best For:**
- Design professions
- Marketing and Media
- Creative agencies
- Arts and Entertainment
- Portfolio-heavy roles

**Characteristics:**
- Sidebar layout
- Skill tags and proficiency bars
- Color gradients
- Visual separators

## Usage

### Basic Template Switching

```javascript
// Initialize the template engine
window.TemplateEngine.init();

// Switch to a template
await window.TemplateEngine.switchTemplate('modern');

// Get current template
const currentTemplate = window.TemplateEngine.getCurrentTemplate();
```

### Customization

#### Colors

```javascript
// Apply a color preset
window.TemplateCustomizer.applyColorPreset('professional');

// Custom colors
window.TemplateCustomizer.setColors({
    primary: '#2c3e50',
    secondary: '#3498db',
    accent: '#1abc9c'
});
```

**Available Color Presets:**
- `professional` - Professional Blue
- `executive` - Executive Navy
- `creative` - Creative Purple
- `modern` - Modern Green
- `minimal` - Minimal Gray
- `warm` - Warm Orange

#### Typography

```javascript
// Apply a typography preset
window.TemplateCustomizer.applyTypographyPreset('modern');

// Custom typography
window.TemplateCustomizer.setTypography({
    headingFont: 'Arial, sans-serif',
    bodyFont: 'Calibri, sans-serif',
    fontSize: 11
});
```

**Available Typography Presets:**
- `classic` - Classic Serif (Georgia, Times New Roman)
- `modern` - Modern Sans (Helvetica Neue)
- `professional` - Professional (Arial, Calibri)
- `creative` - Creative Mix (Montserrat, Open Sans)
- `technical` - Technical (Roboto, Source Sans Pro)

#### Spacing

```javascript
// Apply a spacing preset
window.TemplateCustomizer.applySpacingPreset('normal');

// Custom spacing
window.TemplateCustomizer.setSpacing({
    sectionSpacing: 16,
    itemSpacing: 8,
    margins: 25
});
```

**Available Spacing Presets:**
- `compact` - Compact (more content per page)
- `normal` - Normal (balanced)
- `spacious` - Spacious (more whitespace)

#### Page Size

```javascript
// Set page size
window.TemplateCustomizer.setPageSize('letter'); // or 'a4'
```

### Template Registry

```javascript
// Get all templates
const templates = window.TemplateRegistry.getAllTemplates();

// Get template by ID
const template = window.TemplateRegistry.getTemplate('classic');

// Search templates
const results = window.TemplateRegistry.searchTemplates('modern');

// Get recommendations for industry
const recommended = window.TemplateRegistry.getRecommendedTemplates('technology');

// Get templates by ATS score
const highScore = window.TemplateRegistry.getTemplatesByAtsScore(90);

// Compare templates
const comparison = window.TemplateRegistry.compareTemplates('classic', 'modern');
```

### Event Listening

```javascript
// Listen for template changes
window.TemplateEngine.addEventListener((event, data) => {
    if (event === 'templateChanged') {
        console.log('Template changed:', data.name);
    }
    if (event === 'stylesCustomized') {
        console.log('Styles customized:', data);
    }
});
```

## Template Metadata Structure

Each template includes comprehensive metadata:

```javascript
{
    id: 'classic',
    name: 'Classic Professional',
    category: 'classic',
    description: 'Traditional single-column layout...',
    atsScore: 100,
    layout: {
        type: 'single-column',
        columns: 1,
        sections: ['header', 'summary', 'experience', 'education', 'skills']
    },
    colorScheme: {
        primary: '#000000',
        secondary: '#333333',
        accent: '#666666',
        text: '#000000',
        background: '#ffffff',
        border: '#cccccc'
    },
    typography: {
        headingFont: 'Georgia, serif',
        bodyFont: 'Times New Roman, serif',
        baseSize: 11,
        headingSizes: { h1: 18, h2: 14, h3: 12 },
        lineHeight: 1.4
    },
    spacing: {
        sectionSpacing: 16,
        itemSpacing: 8,
        margins: { top: 25, right: 25, bottom: 25, left: 25 }
    },
    pageSize: ['a4', 'letter'],
    features: {
        colorSupport: false,
        icons: false,
        graphics: false,
        multiColumn: false,
        atsOptimized: true
    },
    bestFor: ['Corporate', 'Finance', 'Legal', 'Healthcare', 'Government']
}
```

## ATS Compatibility

All templates are designed with ATS (Applicant Tracking System) compatibility in mind:

### Best Practices Implemented

1. **Semantic HTML Structure**
   - Proper heading hierarchy (h1, h2, h3)
   - Logical section ordering
   - List elements for achievements

2. **Text-Based Formatting**
   - No text in images
   - Readable fonts
   - Sufficient color contrast

3. **Simple Layout**
   - Minimal complexity
   - Clear section breaks
   - Consistent spacing

4. **Print-Friendly**
   - Page break control
   - Print-safe colors
   - Proper margins

### ATS Score Breakdown

| Template | Score | Reason |
|----------|-------|--------|
| Classic | 100 | Maximum compatibility - no graphics, simple structure |
| Modern | 95 | Minor color elements, still highly compatible |
| Creative | 85 | Two-column layout may confuse some older ATS |

## Customization Presets

### Creating Custom Presets

```javascript
// Create a custom color preset
window.TemplateCustomizer.createCustomPreset('colors', 'myBrand', {
    name: 'My Brand Colors',
    primary: '#1a1a1a',
    secondary: '#ff6600',
    accent: '#00ccff'
});

// Apply custom preset
window.TemplateCustomizer.applyColorPreset('myBrand');
```

### Export/Import Configuration

```javascript
// Export current configuration
const config = window.TemplateEngine.exportConfiguration();

// Import configuration
await window.TemplateEngine.importConfiguration(config);
```

## Integration with ATSFlow

The template system integrates with other ATSFlow components:

### With Preview Engine

```javascript
// The preview engine will use templates to render resumes
// Templates are automatically applied to the preview panel
```

### With Export System

```javascript
// Templates are used when generating PDF/DOCX exports
// Page breaks are automatically calculated
```

### With Editor

```javascript
// Real-time template switching in the editor
// Preview updates reflect template changes immediately
```

## Testing

A test page is available at `/template-test.html` to verify:

- Template switching
- Color customization
- Typography changes
- Spacing adjustments
- Page size configuration

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Print Support

All templates include print-specific CSS:

```css
@media print {
    /* Optimized for printing */
    /* Page break control */
    /* Color preservation */
}
```

## Performance

- **Template Loading:** < 100ms per template
- **Switching:** Instant (CSS injection)
- **Customization:** Real-time updates
- **Memory:** < 1MB for all templates

## File Structure

```
ATSFlow/
├── js/
│   └── templates/
│       ├── engine.js       (5.2 KB)
│       ├── registry.js     (8.7 KB)
│       └── customizer.js   (7.1 KB)
└── css/
    └── templates/
        ├── classic.css     (8.3 KB)
        ├── modern.css      (10.1 KB)
        └── creative.css    (12.4 KB)
```

## Future Enhancements

Potential additions for Wave 2+:

1. More templates (Minimalist, Executive, Academic)
2. Custom font uploads
3. Template builder/editor
4. Template marketplace
5. Industry-specific templates
6. Live template preview thumbnails
7. Template animations/transitions
8. Collaborative template sharing

## API Reference

### TemplateEngine

| Method | Description | Returns |
|--------|-------------|---------|
| `init()` | Initialize engine | void |
| `loadTemplate(id)` | Load template by ID | Promise<boolean> |
| `switchTemplate(id)` | Switch to template | Promise<boolean> |
| `getCurrentTemplate()` | Get active template | Object |
| `applyCustomStyles(obj)` | Apply custom styles | void |
| `resetCustomizations()` | Reset to defaults | void |
| `addEventListener(cb)` | Add event listener | void |

### TemplateRegistry

| Method | Description | Returns |
|--------|-------------|---------|
| `getTemplate(id)` | Get template metadata | Object |
| `getAllTemplates()` | Get all templates | Array |
| `getTemplatesByCategory(cat)` | Filter by category | Array |
| `getTemplatesByAtsScore(min)` | Filter by ATS score | Array |
| `searchTemplates(query)` | Search templates | Array |
| `getRecommendedTemplates(industry)` | Get recommendations | Array |
| `compareTemplates(id1, id2)` | Compare two templates | Object |

### TemplateCustomizer

| Method | Description | Returns |
|--------|-------------|---------|
| `setColors(obj)` | Set colors | void |
| `setTypography(obj)` | Set typography | void |
| `setSpacing(obj)` | Set spacing | void |
| `setPageSize(size)` | Set page size | boolean |
| `applyColorPreset(name)` | Apply color preset | boolean |
| `applyTypographyPreset(name)` | Apply typography preset | boolean |
| `applySpacingPreset(name)` | Apply spacing preset | boolean |
| `reset()` | Reset all customizations | void |
| `getCurrentCustomizations()` | Get current settings | Object |

## License

Part of the ATSFlow project.

## Support

For issues or questions about the template system, see the main ATSFlow documentation.
