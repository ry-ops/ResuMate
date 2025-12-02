# Template Comparison Guide

## Quick Reference Table

| Template | ATS Score | Layout | Colors | Fonts | Margins | Best For |
|----------|-----------|--------|--------|-------|---------|----------|
| **Classic** | 100/100 | Single | B&W | Serif | 25mm | Corporate, Finance, Legal |
| **Modern** | 95/100 | Single | Blue/Teal | Sans | 30mm | Tech, Marketing, Startups |
| **Creative** | 85/100 | Two-col | Red/Orange | Sans | 20mm | Design, Media, Arts |
| **Executive** ⭐ | 93/100 | Single | Navy/Gold | Serif | 35mm | C-Suite, VP, Director |
| **Technical** ⭐ | 88/100 | Single | Cyan/Green | Mono | 28mm | Engineers, DevOps, SRE |
| **Minimal** ⭐ | 98/100 | Single | Gray | Light | 40mm | Designers, Writers |

## Visual Style Characteristics

### Classic Professional
```
┌─────────────────────────────────────┐
│         JOHN DOE                     │
│      Professional Title              │
│ ─────────────────────────────────── │
│                                      │
│ EXPERIENCE                           │
│ ─────────────────────────────────── │
│                                      │
│ Job Title                            │
│ Company Name                         │
│ • Achievement 1                      │
│ • Achievement 2                      │
│                                      │
└─────────────────────────────────────┘
```
- Traditional serif fonts
- Black text on white
- Underlines for sections
- Maximum ATS compatibility

---

### Modern Professional
```
┌─────────────────────────────────────┐
│ ████████████████████████████████    │ ← Gradient header
│ █ JOHN DOE                      █    │
│ █ Professional Title            █    │
│ ████████████████████████████████    │
│                                      │
│ ▐ EXPERIENCE                         │
│                                      │
│ ● Job Title                          │
│   @ Company Name                     │
│   ▸ Achievement 1                    │
│   ▸ Achievement 2                    │
│                                      │
└─────────────────────────────────────┘
```
- Blue/teal gradient header
- Sans-serif fonts
- Colored accent bars
- Icons and symbols

---

### Creative Professional
```
┌──────────────┬──────────────────────┐
│ SIDEBAR      │ MAIN CONTENT         │
│              │                      │
│ ◆ Skills     │ EXPERIENCE           │
│   • HTML     │                      │
│   • CSS      │ Job Title            │
│   • JS       │ Company Name         │
│              │                      │
│ ◆ Languages  │ • Achievement 1      │
│   • English  │ • Achievement 2      │
│   • Spanish  │                      │
│              │                      │
└──────────────┴──────────────────────┘
```
- Two-column layout
- Colored sidebar
- Visual hierarchy
- More graphics

---

### Executive Professional ⭐ NEW
```
┌─────────────────────────────────────┐
│                                      │
│         JOHN DOE                     │
│      Professional Title              │
│         ─────────                    │ ← Gold accent
│                                      │
│ EXECUTIVE SUMMARY                    │
│ ─────                                │ ← Gold underline
│ Lorem ipsum dolor sit amet...        │
│                                      │
│ EXPERIENCE                           │
│ ─────                                │
│                                      │
│ Senior Vice President                │
│ Fortune 500 Company                  │
│ ─────────────────────────────────── │
│ — Led strategic initiatives          │
│ — Drove revenue growth               │
│                                      │
└─────────────────────────────────────┘
```
- Garamond/Georgia serif
- Generous whitespace (35mm)
- Gold accent color
- Premium, understated
- Center-aligned header

---

### Technical Professional ⭐ NEW
```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ > JOHN DOE                      │ │ ← Code-style header
│ │ // Software Engineer            │ │
│ │ • contact@email.com             │ │
│ └─────────────────────────────────┘ │
│                                      │
│ ## EXPERIENCE                        │
│ ══════════════════════════════      │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ function Senior Engineer()      │ │
│ │ @ Tech Company                  │ │
│ │ [Remote] {2020-Present}         │ │
│ │                                 │ │
│ │ → Built microservices           │ │
│ │ → Optimized performance         │ │
│ └─────────────────────────────────┘ │
│                                      │
└─────────────────────────────────────┘
```
- JetBrains Mono monospace
- Syntax highlighting colors
- Code-style decorators (>, //, →)
- Compact, information-dense
- Grid layout for skills

---

### Minimal Professional ⭐ NEW
```
┌─────────────────────────────────────┐
│                                      │
│                                      │
│              JOHN DOE                │
│         Professional Title           │
│                                      │
│            ─────────                 │ ← Subtle divider
│                                      │
│                                      │
│          EXPERIENCE                  │
│                                      │
│           Job Title                  │
│         Company Name                 │
│                                      │
│   Designed and implemented...        │
│                                      │
│            ─────                     │
│                                      │
└─────────────────────────────────────┘
```
- Lato/Open Sans light fonts
- Maximum whitespace (40mm)
- Center-aligned
- Minimal dividers
- Typography-focused
- Ultra-clean aesthetic

---

## Color Palettes

### Classic
- Primary: Black (#000000)
- Secondary: Dark Gray (#333333)
- Accent: Gray (#666666)

### Modern
- Primary: Navy (#2c3e50)
- Secondary: Blue (#3498db)
- Accent: Teal (#1abc9c)

### Creative
- Primary: Dark Slate (#34495e)
- Secondary: Red (#e74c3c)
- Accent: Orange (#f39c12)

### Executive ⭐
- Primary: Navy (#1a2332)
- Secondary: Charcoal (#2c3e50)
- Accent: Gold (#b8860b)

### Technical ⭐
- Primary: Dark Gray (#282c34)
- Secondary: Cyan (#61dafb)
- Accent: Green (#98c379)
- Keyword: Purple (#c678dd)
- Function: Yellow (#e5c07b)

### Minimal ⭐
- Primary: Black (#1a1a1a)
- Secondary: Gray (#4a4a4a)
- Accent: Light Gray (#6a6a6a)

---

## Selection Decision Tree

```
START: What industry are you in?
│
├─ Finance/Legal/Healthcare
│  └─> ATS score priority?
│      ├─ Maximum (100) → CLASSIC
│      └─ Premium look → EXECUTIVE
│
├─ Technology/Startups
│  └─> Role type?
│      ├─ Engineering → TECHNICAL
│      └─ Product/Business → MODERN
│
├─ Creative/Design/Media
│  └─> Style preference?
│      ├─ Visual impact → CREATIVE
│      └─ Minimalist → MINIMAL
│
└─ Consulting/Writing
   └─> Experience level?
       ├─ Senior → EXECUTIVE
       └─ Any → MINIMAL
```

---

## Print Preview Comparison

| Template | Margins | Orphans | Widows | Page Breaks | Quality |
|----------|---------|---------|--------|-------------|---------|
| Classic | 0.5in | 3 | 3 | Smart | ★★★★★ |
| Modern | 0.5in | 3 | 3 | Smart | ★★★★★ |
| Creative | 0.4in | 2 | 2 | Smart | ★★★★☆ |
| Executive | 0.7in | 3 | 3 | Smart | ★★★★★ |
| Technical | 0.55in | 2 | 2 | Smart | ★★★★☆ |
| Minimal | 0.8in | 3 | 3 | Smart | ★★★★★ |

---

## ATS Compatibility Details

### 100/100 - Classic
- No colors, simple structure
- Standard fonts (Georgia, Times New Roman)
- Single column
- No graphics or icons
- Traditional section headers

### 98/100 - Minimal
- Near-perfect simplicity
- No colors, no graphics
- Generous whitespace
- Standard fonts
- Center alignment (minor ATS consideration)

### 95/100 - Modern
- Single column (ATS-friendly)
- Colors present but printable
- Standard section headers
- Emojis (minor concern)

### 93/100 - Executive
- Clean structure
- Serif fonts (acceptable)
- Minimal styling
- Gold accent (very subtle)

### 88/100 - Technical
- Information-dense (potential overflow)
- Code styling (decorators)
- Colored backgrounds
- Monospace fonts (less common)

### 85/100 - Creative
- Two-column layout (ATS challenge)
- More graphics
- Colored sidebar
- Some ATS may struggle with column parsing

---

## Font Loading Requirements

Add to HTML `<head>`:

```html
<!-- Google Fonts for templates -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Minimal Template -->
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet">

<!-- Creative Template -->
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">

<!-- Technical Template -->
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
```

---

**Last Updated:** 2025-12-01  
**Template Count:** 6  
**Average ATS Score:** 93.2/100
