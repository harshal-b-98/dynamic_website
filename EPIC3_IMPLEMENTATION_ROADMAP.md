# Epic 3: Dynamic Component Library - Implementation Roadmap

**Date**: 2025-10-13
**Stories**: DYN-17, DYN-15, DYN-16
**Total Points**: 47 (13 + 13 + 21)
**Estimated Time**: 8-10 hours

---

## Current State Analysis

### Existing Components: 39 files

**Atoms** (3):
- ChatMessage
- ThinkingStageIndicator
- InteractionHandler

**Molecules** (1):
- ChatInput

**Organisms** (8):
- ChatInterface
- DynamicPageRenderer
- FloatingChatWidget
- ThinkingProcessView
- LinearThinkingProcess
- ThinkingOverlay
- ImprovedChatWidget
- ComponentErrorBoundary

**UI Components** (13) - Can be reclassified:
- Button ✅
- Card ✅
- Input ✅
- Label ✅
- Textarea ✅
- Select ✅
- Form ✅
- Accordion ✅
- Badge ✅
- Alert ✅
- Table ✅
- Separator ✅
- Tabs ✅

**Dynamic Components** (15) - Organisms:
- HeroSection ✅
- FeatureGrid ✅
- CtaSection ✅
- PageHeader ✅
- RichTextContent ✅
- SectionHeader ✅
- StatsDisplay ✅
- TestimonialBlock ✅
- StepByStep ✅
- FaqAccordion ✅
- FormSection ✅
- MetricCard ✅
- ComparisonTable ✅
- remaining-components.tsx (multiple in one file)

---

## Gap Analysis

**Target**: 50+ components (20 atoms, 15 molecules, 15 organisms)

**Current Reclassified**:
- **Atoms**: 3 current + 13 UI = 16 atoms ✅ (need 4 more)
- **Molecules**: 1 current (need 14 more)
- **Organisms**: 8 current + 15 dynamic = 23 organisms ✅ (exceeds target)

**Missing Components**:

**Atoms Needed** (4):
1. Checkbox
2. Radio
3. Switch
4. Tooltip

**Molecules Needed** (14):
1. FormField (composite: Label + Input + ErrorMessage)
2. SearchBar
3. NavItem
4. SocialLinks
5. Stat
6. Tag
7. Modal
8. Dropdown
9. Breadcrumb
10. Pagination
11. Toast
12. ProgressBar
13. Avatar
14. Skeleton

---

## Implementation Plan

### Phase 1: DYN-17 - Core Component Library (13 pts) - 4 hours

#### Step 1: Reorganize Existing (1 hour)
- Move UI components to atoms folder
- Update imports across codebase
- Ensure all work with existing code

#### Step 2: Build Missing Atoms (1 hour)
- Checkbox component
- Radio component
- Switch component
- Tooltip component

#### Step 3: Build Missing Molecules (2 hours)
- FormField (high priority - used everywhere)
- Modal (high priority)
- Dropdown (high priority)
- Toast (high priority)
- SearchBar
- Pagination
- Breadcrumb
- Avatar
- Tag
- Stat
- NavItem
- SocialLinks
- ProgressBar
- Skeleton

---

### Phase 2: DYN-15 - Theme System (13 pts) - 2 hours

#### Step 1: Design Tokens (30 mins)
- Create `src/lib/theme/tokens.ts`
- Define colors, typography, spacing, shadows
- Export as JavaScript object

#### Step 2: Tailwind Configuration (30 mins)
- Update `tailwind.config.ts` with tokens
- Add dark mode support
- Configure CSS variables

#### Step 3: Theme Provider (1 hour)
- Create `src/components/providers/ThemeProvider.tsx`
- Implement theme switching (light/dark/system)
- Add localStorage persistence
- Create `useTheme()` hook

#### Step 4: Theme Switcher UI (15 mins)
- Create `src/components/molecules/ThemeSwitcher.tsx`
- Sun/Moon/Monitor icons
- Toggle between themes

---

### Phase 3: DYN-16 - Storybook (21 pts) - 4 hours

#### Step 1: Install & Configure (1 hour)
```bash
npx storybook@latest init --type nextjs
npm install --save-dev @storybook/addon-a11y @storybook/addon-themes
```
- Configure `.storybook/main.ts`
- Configure `.storybook/preview.ts`
- Add Tailwind CSS support

#### Step 2: Create Stories - Atoms (1 hour)
- Write stories for all 20 atoms
- Add interactive controls
- Include all variants

#### Step 3: Create Stories - Molecules (1.5 hours)
- Write stories for all 15 molecules
- Add use case examples
- Document props

#### Step 4: Create Stories - Organisms (30 mins)
- Write stories for key organisms
- Focus on most-used components
- Add composition examples

---

## Success Criteria

### DYN-17 ✅
- [ ] 50+ components implemented
- [ ] 20 atoms, 15 molecules, 15+ organisms
- [ ] All TypeScript strict mode
- [ ] Props validated with Zod schemas
- [ ] All responsive
- [ ] < 100ms render time

### DYN-15 ✅
- [ ] Design tokens defined
- [ ] Tailwind configured with tokens
- [ ] Light & dark mode working
- [ ] ThemeProvider implemented
- [ ] All components support theming
- [ ] Theme persistence works

### DYN-16 ✅
- [ ] Storybook installed & configured
- [ ] Stories for 50+ components
- [ ] Interactive controls working
- [ ] Accessibility addon enabled
- [ ] Dark mode toggle in Storybook
- [ ] Deployed to Vercel/Netlify

---

## File Structure

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button.tsx (from ui/)
│   │   ├── Input.tsx (from ui/)
│   │   ├── Checkbox.tsx (NEW)
│   │   ├── Radio.tsx (NEW)
│   │   ├── Switch.tsx (NEW)
│   │   ├── Tooltip.tsx (NEW)
│   │   └── ... (16 more)
│   ├── molecules/
│   │   ├── FormField.tsx (NEW)
│   │   ├── Modal.tsx (NEW)
│   │   ├── Dropdown.tsx (NEW)
│   │   └── ... (12 more)
│   ├── organisms/
│   │   ├── HeroSection.tsx (from dynamic/)
│   │   ├── FeatureGrid.tsx (from dynamic/)
│   │   └── ... (23 total)
│   └── providers/
│       └── ThemeProvider.tsx (NEW)
├── lib/
│   └── theme/
│       └── tokens.ts (NEW)
└── stories/
    ├── atoms/
    ├── molecules/
    └── organisms/
```

---

## Timeline

**Hour 0-1**: Reorganize existing components
**Hour 1-2**: Build missing atoms
**Hour 2-4**: Build missing molecules
**Hour 4-5**: Design tokens & Tailwind config
**Hour 5-6**: ThemeProvider & theme switching
**Hour 6-7**: Install & configure Storybook
**Hour 7-10**: Write stories for all components

**Total**: ~10 hours for 47 story points

---

## Risks & Mitigation

**Risk**: Too many components to build in time
**Mitigation**: Focus on most-used components first, skip nice-to-haves

**Risk**: Storybook configuration issues
**Mitigation**: Use official Next.js integration, follow docs closely

**Risk**: Breaking existing code during reorganization
**Mitigation**: Test after each move, update imports carefully

---

**Status**: Ready to implement
**Next Action**: Start Phase 1, Step 1 - Reorganize existing components
