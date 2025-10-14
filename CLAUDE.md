# Project Information

&nbsp; - Project Name: DynamicWebsite
&nbsp; - Project Key: DYN
&nbsp; - Project Type: Jira Software
&nbsp; - Cloud ID: bb6e05da-d667-476e-bd88-63822cde9734
&nbsp; - Site: https://yoursite.atlassian.net

# 🧠 Project Memory: Dynamic Website Project

## 🗃️ Overview

The **Dynamic Website Project** aims to build a modular, AI-driven, and interactive web platform with adaptive content and UI rendering capabilities.  

This memory file defines the **source of truth** for workflow, documentation, and automation logic across Jira, Confluence, and local files.

The project ensures:
- Continuous synchronization between Jira, Confluence, and local repositories  
- Context-aware execution and documentation  
- Incremental, test-driven feature delivery  
- Built-in improvement and enhancement tracking

---

## ⚙️ Workflow Instructions

### **1. Maintain Global Project Context**
- Always load the **full project context** before starting work.  
- Reference `/Project Documents` for system architecture, design notes, and requirements.  
- This acts as the **base memory** for reasoning and decision-making.  
- Update the folder as new decisions, features, or changes are introduced.

---

### **2. Retrieve and Track Jira Tickets**
- Connect to Jira → fetch ticket details for:
&nbsp; - Current sprint
&nbsp; - Active epics
&nbsp; - Assigned tickets
- Maintain synchronized copies locally in `/JiraUpdates/TicketLogs/`.
- Ensure all local ticket data matches Jira fields (status, description, comments, attachments).

---

### **3. Maintain Local Reference Copy of Confluence**
- Keep a **local mirror** of the active Confluence space in `/Confluence_Local/`.
- Use this local copy for quick context access and version history.
- Refresh it before starting any new ticket or after major sync operations.

---

### **4. Epic-Level Context Management**

For each **Epic**, create a structured folder under `/JiraUpdates/Epics/<Epic_Name>/` containing:

1. **Context.md** → Epic overview, scope, dependencies, objectives  
2. **Progress.md** → Ongoing ticket updates, blockers, milestones  
3. **Learning.md** → Lessons learned, architectural insights, and technical notes  
4. **Enhancements.md** → Continuous improvement ideas and follow-up tasks  

Each of these mirrors a corresponding Confluence page.

---

### **5. Enhancement Workflow**

Each **Epic** must include an `Enhancements.md` file that documents identified improvement areas.

#### Structure:
- **Improvement Idea:** Short description of what can be enhanced  
- **Rationale:** Why this enhancement is valuable  
- **Technical Notes:** Dependencies, affected modules, blockers  
- **Next Steps:** Clear action plan for follow-up  
- **Reference:** Related tickets, commits, or documentation links  

#### Automation Behavior:

When an enhancement is added:
1. Automatically create a **new Jira sub-task** under the same Epic.  
2. Include:
&nbsp;  - Title: `"Enhancement – <Feature/Component Name>"`
&nbsp;  - Description: From the Enhancements.md entry  
&nbsp;  - Comments: `"Auto-created from Enhancement suggestion in Confluence for continuous improvement."`
3. Apply labels: `enhancement`, `next-session`  
4. Assign to the same Epic owner  
5. Mark for follow-up in the next working session

**Example Entry:**
```markdown
### Enhancement #03: Optimize Page Load Speed
- **Rationale:** Improve UX by reducing initial load time.
- **Technical Notes:** Implement lazy loading and defer non-critical JS.
- **Next Steps:** Create Jira sub-task → DYN-2451
- **Status:** Logged for next session
```

---

### **6. Code Alignment and Ticket Execution**

- Always begin with the latest Jira ticket for the session.
- Verify local code repository status and ensure branch sync.
- Update local Confluence copies and Epic Progress.md with ticket status.
- After implementation:
&nbsp;   - Mark Jira ticket as In Review or Done (upon user confirmation).
&nbsp;   - Reflect status updates in Confluence and local markdown files.

---

### **7. API & UI Reference Management**

- Maintain a single reference file: **API_UI_REFERENCE.md**
- Include:
&nbsp;  - **API Endpoints:** URLs, methods, payloads, responses, usage notes
&nbsp;  - **UI Components:** Pages, components, and interactions linked to endpoints
&nbsp;  - **Integration Notes:** Dependencies, modules, or shared state logic
- Always update after every change to API or UI behavior.

---

### **8. Incremental Development Process**

- Follow a ticket-driven incremental development pattern:
&nbsp;  - Implement → Test → Document → Commit → Push → Next Ticket
- Keep changes modular and versioned.
- Each commit must correspond to a specific Jira task.

---

### **9. Testing and Validation**

- Run comprehensive tests before closing any ticket:
&nbsp;  - Unit tests
&nbsp;  - Integration tests
&nbsp;  - UI/UX validation
- Store results in `/Tests/Results/` with convention:
&nbsp;  `[TicketID]_TestResults.md`
- Document notable findings or regressions in the Epic's Learning.md.

---

### **10. Commit and Sync Cycle**

- Use consistent commit messages:
&nbsp;  `[DYN-123] Implemented dynamic homepage rendering + Updated Confluence sync`
- After tests pass:
&nbsp;  - Commit and push to remote repository.
&nbsp;  - Update readme file and relevant information in Git as well if needed.
&nbsp;  - Update ticket status in Jira.
&nbsp;  - Pull the next ticket in sequence.

---

### **11. Epic Closure**

- When an Epic is complete:
&nbsp;  - Update the Epic in Jira → mark as Done.
&nbsp;  - Update local files:
&nbsp;      - Progress.md: Add completion summary and metrics.
&nbsp;      - Enhancements.md: Move pending items to backlog.
&nbsp;      - Learning.md: Add final takeaways.
&nbsp;  - Sync updates to Confluence:
&nbsp;      - Progress Page → final completion log
&nbsp;      - Learning Page → final reflection summary
&nbsp;      - Enhancements Page → carry forward improvements

---

### **12. Session Wrap-Up**

At the end of each work session:
- Sync Jira, local documents, and Confluence.
- Log:
&nbsp;  - Code or ticket updates
&nbsp;  - New enhancements
&nbsp;  - Key insights or blockers
- Update `/JiraUpdates/Epics/<Epic_Name>/Context.md`
- Add a session summary in `/SessionLogs/`:
&nbsp;  `YYYY-MM-DD_SessionSummary.md`

---

## 🎯 Specialized Task Workflows

### **A. Website UI Updates**

When working on UI changes for the website:

#### **Phase 1: Context Loading**
1. **Load Branding Guidelines** from knowledge base
   - Review current brand standards (colors, typography, spacing, components)
   - Note existing UI patterns and design system rules
   - Understand component hierarchy and naming conventions

2. **Understand Current UI State**
   - Review existing website pages and components
   - Check API_UI_REFERENCE.md for current UI-API integrations
   - Identify affected components and dependencies

#### **Phase 2: Implementation**
1. **Implement UI Changes**
   - Apply user-suggested modifications
   - Ensure consistency with branding guidelines
   - Maintain responsive design principles
   - Test across different viewports and browsers

2. **Update Branding Guidelines**
   - Document any new UI patterns introduced
   - Add new components to the design system
   - Update color palettes, typography scales, or spacing if modified
   - Include visual examples and code snippets
   - Note responsive behavior and breakpoints

#### **Phase 3: Documentation**
1. **Update/Create Confluence Pages**
   - Create or update page under "Dynamic Website" space
   - Structure: 
     - **Overview:** What was changed and why
     - **Before/After:** Visual comparison if applicable
     - **Implementation Details:** Technical notes
     - **Branding Updates:** New guidelines added
     - **Related Tickets:** Link to Jira tickets
   
2. **Update Local Files**
   - Sync changes to `/Confluence_Local/UI_Updates/`
   - Update API_UI_REFERENCE.md with UI component changes
   - Log in appropriate Epic's Progress.md

3. **Update Branding Guidelines Document**
   - Reflect all changes in the master branding doc
   - Version the changes with date stamps
   - Ensure future page generation follows updated guidelines

#### **Validation Checklist:**
- [ ] UI changes match user requirements
- [ ] Branding guidelines document updated
- [ ] Confluence page created/updated
- [ ] Local files synchronized
- [ ] API_UI_REFERENCE.md reflects changes
- [ ] Responsive design verified
- [ ] Cross-browser compatibility checked
- [ ] Jira ticket updated with completion status

---

### **B. Website Copywriting**

When working on website content and copy:

#### **Phase 1: Context Loading**
1. **Load Website Content Document** from knowledge base
   - Review current content structure and tone
   - Understand messaging hierarchy
   - Note brand voice guidelines and style preferences
   - Identify content sections and their purposes

2. **Review User Suggestions**
   - Parse all requested copy changes
   - Note tone, messaging, or structural adjustments
   - Identify any new sections or removed content

#### **Phase 2: Implementation**
1. **Apply Content Changes**
   - Implement user-suggested modifications
   - Maintain consistent brand voice and tone
   - Ensure grammatical accuracy and readability
   - Verify content hierarchy and flow
   - Check for SEO considerations (if applicable)

2. **Update Website Content Document**
   - Reflect all changes in the master content doc
   - Update content guidelines if tone or style evolves
   - Add new content sections or templates
   - Document rationale for significant changes
   - Version control with date stamps

#### **Phase 3: Documentation**
1. **Update/Create Confluence Pages**
   - Create or update page under "Dynamic Website" → "Content & Copywriting"
   - Structure:
     - **Content Changes Summary:** Overview of modifications
     - **Before/After:** Side-by-side comparison of key changes
     - **Rationale:** Why changes were made
     - **Voice & Tone Notes:** Any brand voice adjustments
     - **SEO Considerations:** Keywords, meta descriptions (if relevant)
     - **Related Tickets:** Link to Jira tickets

2. **Update Local Files**
   - Sync to `/Confluence_Local/Content_Updates/`
   - Update Epic Progress.md with content milestones
   - Log significant content decisions in Learning.md

3. **Update Master Content Document**
   - Ensure all copy changes are reflected
   - Update content templates for future pages
   - Maintain content style guide consistency

#### **Validation Checklist:**
- [ ] All user-suggested changes implemented
- [ ] Brand voice and tone maintained
- [ ] Website content document updated
- [ ] Confluence page created/updated
- [ ] Local files synchronized
- [ ] Content flows logically
- [ ] Grammar and spelling verified
- [ ] Jira ticket updated with completion status

---

### **C. Cross-Task Documentation Requirements**

For both UI Updates and Copywriting tasks:

1. **Confluence Integration**
   - All work must be documented in "Dynamic Website" Confluence space
   - Create nested pages under appropriate parent pages:
     - UI Updates → "Dynamic Website" → "UI & Design"
     - Copywriting → "Dynamic Website" → "Content & Copywriting"
   - Use consistent page naming: `[DYN-XXX] - [Brief Description]`

2. **Jira Ticket Management**
   - Link Confluence pages to corresponding Jira tickets
   - Update ticket status after each phase completion
   - Add comments with links to documentation
   - Tag with appropriate labels: `ui-update`, `copywriting`, `documentation`

3. **Knowledge Base Maintenance**
   - Always treat knowledge base documents as source of truth
   - Update knowledge base docs before creating Confluence pages
   - Ensure bidirectional consistency between KB and Confluence

4. **Session Logging**
   - Document all UI and content changes in session summaries
   - Note any decisions made regarding branding or messaging
   - Track time spent and complexity of changes

---

## 📁 Folder Structure Reference

```
/DynamicWebsiteProject
│
├── Project Documents/
│   ├── Architecture.md
│   ├── Requirements.md
│   ├── DesignNotes.md
│   ├── BrandingGuidelines.md       ← Master branding doc
│   └── WebsiteContent.md           ← Master content doc
│
├── JiraUpdates/
│   ├── Epics/
│   │   ├── Epic1/
│   │   │   ├── Context.md
│   │   │   ├── Progress.md
│   │   │   ├── Learning.md
│   │   │   └── Enhancements.md
│   │   └── Epic2/
│   │       ├── Context.md
│   │       ├── Progress.md
│   │       ├── Learning.md
│   │       └── Enhancements.md
│   └── TicketLogs/
│       ├── DYN-101_Update.md
│       └── DYN-102_Update.md
│
├── Confluence_Local/
│   ├── Dynamic Website Overview.md
│   ├── UI_Updates/                 ← UI-specific updates
│   ├── Content_Updates/            ← Copywriting updates
│   └── Epics/
│       └── Epic1/
│           ├── Learning.md
│           ├── Progress.md
│           └── Enhancements.md
│
├── API_UI_REFERENCE.md
├── Tests/
│   ├── Scripts/
│   └── Results/
└── SessionLogs/
    ├── 2025-10-09_SessionSummary.md
    └── ...
```

---

## 🔄 Quick Reference: Task Execution Flow

### For UI Updates:
```
1. Load Branding Guidelines (KB)
2. Review user's UI change requests
3. Implement changes
4. Update Branding Guidelines document
5. Create/Update Confluence page
6. Sync local files
7. Update Jira ticket
8. Log in session summary
```

### For Copywriting:
```
1. Load Website Content Document (KB)
2. Review user's content change requests
3. Implement copy changes
4. Update Website Content Document
5. Create/Update Confluence page
6. Sync local files
7. Update Jira ticket
8. Log in session summary
```

---

## 💡 Key Principles

- **Knowledge Base First:** Always reference KB docs before making changes
- **Document Everything:** Every change must be reflected in Confluence and local files
- **Maintain Consistency:** Update master docs so future work follows the same standards
- **Bidirectional Sync:** Changes flow from KB → Implementation → Confluence → Local Files
- **Traceability:** Every change must be linkable to a Jira ticket
- **Future-Proof:** Update guidelines so future pages/content follow established patterns