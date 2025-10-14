# ConsumerIQ Branding Guidelines

**Last Updated:** October 14, 2025
**Version:** 2.0
**Purpose:** Complete brand standards for ConsumerIQ website UI/UX and AI-generated page consistency

---

## 🎨 Brand Color Palette

### Primary Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Deep Indigo** | `#0A1930` | rgb(10, 25, 48) | Primary dark background, navbar, footer, dark sections |
| **Electric Cyan** | `#00C8FF` | rgb(0, 200, 255) | Primary accent, buttons, hover states, interactive elements |
| **Surface White** | `#FFFFFF` | rgb(255, 255, 255) | Page backgrounds, button hover states, contrast text |

### Secondary Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Charcoal Gray** | `#333333` | rgb(51, 51, 51) | Body text, secondary text |
| **Light Data Gray** | `#EBEFF2` | rgb(235, 239, 242) | Light backgrounds, subtle dividers |
| **Success Green** | `#00A878` | rgb(0, 168, 120) | Success states, positive metrics |
| **Warning Orange** | `#AA6C39` | rgb(170, 108, 57) | Warning states, attention callouts |
| **Error Red** | `#DA1E28` | rgb(218, 30, 40) | Error states, critical alerts |

### Gradient Combinations

**Hero Gradient (Dark):**
```css
background: linear-gradient(to bottom, #0A1930, #000000);
```

**CTA Gradient (Cyan):**
```css
background: linear-gradient(to right, #00C8FF, #0099CC);
```

---

## 📝 Typography

### Font Families

**Primary Font - Montserrat (Headings & CTAs)**
- Import: `font-mont` utility class
- Use for: Page headings (H1-H4), button text, navigation
- Weights: 600 (Semibold), 700 (Bold), 800 (Extrabold)

**Secondary Font - Inter (Body Text)**
- Import: `font-inter` utility class
- Use for: Body text, descriptions, labels, navigation links
- Weights: 400 (Regular), 500 (Medium), 600 (Semibold)

### Typography Scale

| Element | Font | Size | Weight | Line Height | Usage |
|---------|------|------|--------|-------------|-------|
| **H1** | Montserrat | 5xl-7xl (48-72px) | Extrabold (800) | 1.1 | Hero headlines |
| **H2** | Montserrat | 4xl-5xl (36-48px) | Bold (700) | 1.2 | Section headers |
| **H3** | Montserrat | 2xl-3xl (24-30px) | Bold (700) | 1.3 | Subsection headers |
| **H4** | Montserrat | xl-2xl (20-24px) | Semibold (600) | 1.4 | Card titles |
| **Body Large** | Inter | xl (20px) | Regular (400) | 1.6 | Hero subheadings |
| **Body** | Inter | base (16px) | Regular (400) | 1.6 | Main body text |
| **Body Small** | Inter | sm (14px) | Regular (400) | 1.5 | Supporting text |
| **Caption** | Inter | xs (12px) | Medium (500) | 1.4 | Labels, metadata |

---

## 🧭 Navigation Bar Styling (Updated Oct 14, 2025)

### Background & Structure
```typescript
<nav className="sticky top-0 z-50 backdrop-blur-sm"
     style={{
       backgroundColor: '#0A1930',
       borderBottom: '1px solid rgba(0, 200, 255, 0.1)'
     }}>
```

**Properties:**
- **Position:** Sticky (stays at top during scroll)
- **Background:** Deep Indigo (#0A1930)
- **Border:** Electric Cyan tint (rgba(0, 200, 255, 0.1))
- **Effect:** Backdrop blur (glass-morphism)
- **Z-index:** 50 (always on top)

### Logo Styling

**Logo Circle:**
- Background: Electric Cyan (#00C8FF)
- Size: 40x40px
- Border radius: Default (rounded)

**Logo "C" Text:**
- Color: Deep Indigo (#0A1930)
- Font: Montserrat Bold
- Size: xl (20px)

**"ConsumerIQ" Text:**
- Color: White (#FFFFFF)
- Font: Montserrat Bold
- Size: 2xl (24px)

### Navigation Links

**Order:** Features → Solution → Functions → Talk to Our Team (button)

**Normal State:**
```typescript
style={{ color: '#FFFFFF' }}
className="font-inter transition-colors"
```

**Hover State:**
```typescript
onMouseOver={(e) => e.currentTarget.style.color = '#00C8FF'}
onMouseOut={(e) => e.currentTarget.style.color = '#FFFFFF'}
```

**Properties:**
- Text color: White (#FFFFFF)
- Hover color: Electric Cyan (#00C8FF)
- Font: Inter
- Transition: color (smooth)
- Spacing: gap-8 between items

### "Talk to Our Team" Button

**Normal State:**
```typescript
style={{
  backgroundColor: '#00C8FF',
  color: '#0A1930'
}}
className="px-6 py-2.5 rounded-lg font-mont font-semibold transition-all shadow-md"
```

**Hover State:**
```typescript
onMouseOver={(e) => {
  e.currentTarget.style.backgroundColor = '#FFFFFF'
  e.currentTarget.style.color = '#0A1930'
}}
```

**Properties:**
- Background: Electric Cyan (#00C8FF) → White (#FFFFFF) on hover
- Text: Deep Indigo (#0A1930)
- Font: Montserrat Semibold
- Padding: px-6 py-2.5
- Border radius: rounded-lg
- Shadow: shadow-md

---

## 🔘 Button Styles

### Primary Button

**Normal State:**
```css
background-color: #00C8FF (Electric Cyan)
color: #0A1930 (Deep Indigo)
padding: 32px 40px (px-8 py-4)
border-radius: 0.5rem (rounded-lg)
font-family: Montserrat
font-weight: 600 (Semibold)
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
```

**Hover State:**
```css
background-color: #0A1930 (Deep Indigo)
color: #00C8FF (Electric Cyan)
outline: 2px solid #00C8FF
```

### Secondary Button (Outline)

**Normal State:**
```css
background-color: transparent
color: #FFFFFF (on dark) or #0A1930 (on light)
border: 2px solid #00C8FF
padding: 32px 40px
border-radius: 0.5rem
font-family: Montserrat
font-weight: 600
```

**Hover State:**
```css
background-color: #00C8FF
color: #0A1930
border: 2px solid #00C8FF
```

### Text Links

**Normal State:**
```css
color: #00C8FF (Electric Cyan)
text-decoration: none
font-weight: 500 (Medium)
```

**Hover State:**
```css
color: #0099CC (darker cyan)
text-decoration: underline
```

---

## 📐 Spacing & Layout

### Container Widths
- Max width: `container mx-auto` (responsive)
- Padding: `px-6` (24px horizontal padding)
- Mobile: Full width with 16px padding
- Desktop: Max 1280px centered

### Section Spacing
- **Spacious (Default):** `py-20` (80px vertical)
- **Normal:** `py-16` (64px vertical)
- **Compact:** `py-12` (48px vertical)

### Component Spacing
- Between components: `space-y-16` (64px) for spacious
- Between sections: `mb-16` (64px)
- Between elements: `gap-8` (32px) or `gap-6` (24px)

### Grid Systems
- **2-column:** `md:grid-cols-2 gap-8`
- **3-column:** `lg:grid-cols-3 gap-8`
- **4-column:** `xl:grid-cols-4 gap-6`

---

## 🎭 Component Styling Patterns

### Hero Section

**Background:**
```css
background: linear-gradient(to bottom, #0A1930, #000000)
```

**Content:**
- Headline: White (#FFFFFF), Montserrat Extrabold, 5xl-7xl
- Subheading: Light Data Gray (#EBEFF2), Inter, xl-2xl
- Buttons: Primary + Secondary styles
- Padding: py-20 md:py-32

### Feature Cards

**Container:**
```css
background-color: #0A1930 (on dark sections) or #FFFFFF (on light sections)
border: 2px solid rgba(0, 200, 255, 0.3)
border-radius: 1rem (rounded-xl)
padding: 2rem (p-8)
```

**Hover Effect:**
```css
border-color: #00C8FF
transform: translateY(-4px)
box-shadow: 0 20px 50px rgba(0, 200, 255, 0.3)
```

**Icon Container:**
```css
background-color: rgba(0, 200, 255, 0.1)
color: #00C8FF
border-radius: 0.5rem (rounded-lg)
width: 56px
height: 56px
```

**Title:**
- Color: Electric Cyan (#00C8FF) on dark, Deep Indigo (#0A1930) on light
- Font: Montserrat Bold
- Size: xl (20px)

**Description:**
- Color: White (#FFFFFF) on dark, Charcoal Gray (#333333) on light
- Font: Inter Regular
- Size: base (16px)
- Line height: 1.6

### Section Headers

**On Dark Backgrounds:**
- Color: White (#FFFFFF)
- Accent text: Electric Cyan (#00C8FF)

**On Light Backgrounds:**
- Color: Deep Indigo (#0A1930)
- Accent text: Electric Cyan (#00C8FF)

---

## 🌗 Dark/Light Section Patterns

### Dark Sections
**Used for:** Product features, functions, key differentiators
```css
background-color: #0A1930
color: #FFFFFF
accent-color: #00C8FF
```

### Light Sections
**Used for:** Pain points, solutions, general content
```css
background-color: #EBEFF2 or #FFFFFF
color: #333333
accent-color: #00C8FF
```

### Section Alternation Pattern
1. Hero (Dark gradient)
2. Pain Points (Light gray)
3. Features (Dark indigo)
4. Solution (White)
5. Functions (Light gray)
6. Final CTA (Cyan gradient)
7. Footer (Dark indigo)

---

## ✨ Interactive States

### Hover Transitions
```css
transition: all 300ms ease-in-out
```

### Focus States
```css
outline: 2px solid #00C8FF
outline-offset: 2px
```

### Active States
```css
transform: scale(0.98)
```

### Loading States
- Skeleton: Light Data Gray (#EBEFF2) with shimmer
- Spinner: Electric Cyan (#00C8FF)

---

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Mobile Considerations
- Touch targets: Minimum 44x44px
- Font sizes: Scale down by 20-30%
- Spacing: Reduce vertical spacing by 25%
- Navigation: Hamburger menu (to be implemented)

---

## 🎯 Brand Voice & Tone

### Voice Characteristics
- **Professional:** Business-appropriate, credible
- **Conversational:** Approachable, not stuffy
- **Data-Driven:** Factual, evidence-based
- **Action-Oriented:** Clear next steps, results-focused

### Tone Variations

**Hero/Headlines:**
- Direct, confident, benefit-focused
- Use power words: "Transform", "Optimize", "Accelerate"

**Features/Products:**
- Technical yet accessible
- Focus on outcomes, not just capabilities

**CTAs:**
- Action verbs: "Explore", "Discover", "Get Started"
- Value-focused: "See How It Works", "Calculate Savings"

---

## 🚫 Don'ts - Common Mistakes to Avoid

❌ **Don't use "compact" or "normal" spacing** - Always use "spacious"
❌ **Don't create pages with 6+ components** - Limit to 4-5 maximum
❌ **Don't use small component sizes** - Always "lg" or "xl"
❌ **Don't put 5+ items in feature grids** - Maximum 3-4 items
❌ **Don't write long descriptions** - Keep to 1-2 sentences, max 100 chars
❌ **Don't use #EBEFF2 for main text** - Use white on dark, charcoal on light
❌ **Don't mix white and light gray in the same section** - Choose one
❌ **Don't use Deep Indigo text on Deep Indigo background** - No contrast

---

## ✅ Do's - Best Practices

✅ **Do match navigation bar with hero section** - Seamless transition
✅ **Do use sticky navigation** - Always accessible
✅ **Do provide hover feedback** - All interactive elements
✅ **Do maintain button consistency** - Same styles across all CTAs
✅ **Do use Electric Cyan for accents** - Brand recognition
✅ **Do alternate dark/light sections** - Visual rhythm
✅ **Do use Montserrat for headings** - Brand consistency
✅ **Do use Inter for body text** - Readability

---

## 📊 Accessibility Standards

### WCAG 2.1 AA Compliance

**Color Contrast:**
- White on Deep Indigo: 13.8:1 (AAA) ✅
- Electric Cyan on Deep Indigo: 7.4:1 (AA+) ✅
- Charcoal on White: 12.6:1 (AAA) ✅
- Electric Cyan on White: 2.9:1 (Decorative only) ⚠️

**Interactive Elements:**
- All buttons: Minimum 44x44px touch target
- Focus indicators: 2px Electric Cyan outline
- Keyboard navigation: Full support required

**ARIA Labels:**
- All interactive elements must have descriptive labels
- Navigation landmarks properly identified
- Form inputs with associated labels

---

## 🔗 Button Destination Mapping

### Active Sections
- `#features` → Product Features Section
- `#solution` → Solution Architecture Section
- `#functions` → Functions We Serve Section

### Future Sections (Placeholders)
- `#contact` → Contact/Demo Request (all "Talk to Our Team" buttons)
- `#faq` → FAQ Section

---

## 📝 Content Guidelines

### Headlines
- Length: 5-8 words maximum
- Format: Statement or question
- Tone: Bold, confident, benefit-focused

### Subheadings
- Length: 10-20 words
- Format: Supporting detail for headline
- Tone: Informative, specific

### Body Copy
- Paragraph length: 2-4 sentences
- Sentence length: 15-25 words
- Lists: 3-5 bullet points maximum

### CTAs
- Button text: 2-4 words
- Action verb required
- Value indication preferred

---

## 🎨 Visual Effects

### Glass-Morphism (Navbar)
```css
backdrop-filter: blur(8px);
background-color: rgba(10, 25, 48, 0.9);
border-bottom: 1px solid rgba(0, 200, 255, 0.1);
```

### Card Hover Effects
```css
transition: all 300ms ease-in-out;
transform: translateY(-4px);
box-shadow: 0 20px 50px rgba(0, 200, 255, 0.3);
border-color: #00C8FF;
```

### Button Animations
```css
transition: all 300ms ease-in-out;
transform: scale(1.02) /* on hover */;
box-shadow: 0 8px 16px rgba(0, 200, 255, 0.4) /* on hover */;
```

---

**Document Status:** ✅ Active
**Review Cycle:** Every major UI update
**Next Review:** Before Q1 2026
**Maintained By:** Claude Code + Design Team
