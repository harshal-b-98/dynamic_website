\# Project Information



&nbsp; - Project Name: DynamicWebsite

&nbsp; - Project Key: DYN

&nbsp; - Project Type: Jira Software

&nbsp; - Cloud ID: bb6e05da-d667-476e-bd88-63822cde9734

&nbsp; - Site: https://yoursite.atlassian.net


\# 🧠 Project Memory: Dynamic Website Project



\## 🏗️ Overview

The \*\*Dynamic Website Project\*\* aims to build a modular, AI-driven, and interactive web platform with adaptive content and UI rendering capabilities.  

This memory file defines the \*\*source of truth\*\* for workflow, documentation, and automation logic across Jira, Confluence, and local files.



The project ensures:

\- Continuous synchronization between Jira, Confluence, and local repositories  

\- Context-aware execution and documentation  

\- Incremental, test-driven feature delivery  

\- Built-in improvement and enhancement tracking



---



\## ⚙️ Workflow Instructions



\### \*\*1. Maintain Global Project Context\*\*

\- Always load the \*\*full project context\*\* before starting work.  

\- Reference `/Project Documents` for system architecture, design notes, and requirements.  

\- This acts as the \*\*base memory\*\* for reasoning and decision-making.  

\- Update the folder as new decisions, features, or changes are introduced.



---



\### \*\*2. Retrieve and Track Jira Tickets\*\*

\- Connect to Jira → fetch ticket details for:

&nbsp; - Current sprint

&nbsp; - Active epics

&nbsp; - Assigned tickets

\- Maintain synchronized copies locally in `/JiraUpdates/TicketLogs/`.

\- Ensure all local ticket data matches Jira fields (status, description, comments, attachments).



---



\### \*\*3. Maintain Local Reference Copy of Confluence\*\*

\- Keep a \*\*local mirror\*\* of the active Confluence space in `/Confluence\_Local/`.

\- Use this local copy for quick context access and version history.

\- Refresh it before starting any new ticket or after major sync operations.



---



\### \*\*4. Epic-Level Context Management\*\*

For each \*\*Epic\*\*, create a structured folder under `/JiraUpdates/Epics/<Epic\_Name>/` containing:



1\. \*\*Context.md\*\* → Epic overview, scope, dependencies, objectives  

2\. \*\*Progress.md\*\* → Ongoing ticket updates, blockers, milestones  

3\. \*\*Learning.md\*\* → Lessons learned, architectural insights, and technical notes  

4\. \*\*Enhancements.md\*\* → Continuous improvement ideas and follow-up tasks  



Each of these mirrors a corresponding Confluence page.



---



\### \*\*5. Enhancement Workflow\*\*

Each \*\*Epic\*\* must include an `Enhancements.md` file that documents identified improvement areas.



\#### Structure:

\- \*\*Improvement Idea:\*\* Short description of what can be enhanced  

\- \*\*Rationale:\*\* Why this enhancement is valuable  

\- \*\*Technical Notes:\*\* Dependencies, affected modules, blockers  

\- \*\*Next Steps:\*\* Clear action plan for follow-up  

\- \*\*Reference:\*\* Related tickets, commits, or documentation links  



\#### Automation Behavior:

When an enhancement is added:

1\. Automatically create a \*\*new Jira sub-task\*\* under the same Epic.  

2\. Include:

&nbsp;  - Title: `"Enhancement – <Feature/Component Name>"`

&nbsp;  - Description: From the Enhancements.md entry  

&nbsp;  - Comments: `"Auto-created from Enhancement suggestion in Confluence for continuous improvement."`

3\. Apply labels: `enhancement`, `next-session`  

4\. Assign to the same Epic owner  

5\. Mark for follow-up in the next working session



\*\*Example Entry:\*\*

```markdown

\### Enhancement #03: Optimize Page Load Speed

\- \*\*Rationale:\*\* Improve UX by reducing initial load time.

\- \*\*Technical Notes:\*\* Implement lazy loading and defer non-critical JS.

\- \*\*Next Steps:\*\* Create Jira sub-task → DYN-2451

\- \*\*Status:\*\* Logged for next session


6\. Code Alignment and Ticket Execution

&nbsp;- Always begin with the latest Jira ticket for the session.

&nbsp;- Verify local code repository status and ensure branch sync.

&nbsp;- Update local Confluence copies and Epic Progress.md with ticket status.

&nbsp;- After implementation:

&nbsp;   - Mark Jira ticket as In Review or Done (upon user confirmation).

&nbsp;   - Reflect status updates in Confluence and local markdown files.



7\. API \& UI Reference Management

&nbsp;- Maintain a single reference file: API\_UI\_REFERENCE.md

&nbsp;  Include:

&nbsp;	- API Endpoints: URLs, methods, payloads, responses, usage notes

&nbsp;	- UI Components: Pages, components, and interactions linked to endpoints

&nbsp;	- Integration Notes: Dependencies, modules, or shared state logic

&nbsp;  Always update after every change to API or UI behavior.



8\. Incremental Development Process

&nbsp;- Follow a ticket-driven incremental development pattern:

&nbsp;	-Implement → Test → Document → Commit → Push → Next Ticket

&nbsp;- Keep changes modular and versioned.

&nbsp;- Each commit must correspond to a specific Jira task.



9\. Testing and Validation

&nbsp;- Run comprehensive tests before closing any ticket:

&nbsp;	-Unit tests
	-Integration tests

&nbsp;	-UI/UX validation

&nbsp;- Store results in /Tests/Results/ with convention:

&nbsp;	csharp

&nbsp;	Copy code

&nbsp;	 \[TicketID]\_TestResults.md

&nbsp;- Document notable findings or regressions in the Epic’s Learning.md.



10\. Commit and Sync Cycle

&nbsp;- Use consistent commit messages:

&nbsp;	csharp

&nbsp;	Copy code

&nbsp;	 \[DYN-123] Implemented dynamic homepage rendering + Updated Confluence sync

&nbsp;- After tests pass:

&nbsp;	-Commit and push to remote repository.

&nbsp;	-Update readme file and relevant information in GIt as well if needed.

&nbsp;	-Update ticket status in Jira.

&nbsp;	-Pull the next ticket in sequence.



11\. Epic Closure

&nbsp;- When an Epic is complete:

&nbsp;	- Update the Epic in Jira → mark as Done.

&nbsp;	- Update local files:

&nbsp;	    - Progress.md: Add completion summary and metrics.

&nbsp;	    - Enhancements.md: Move pending items to backlog.

&nbsp;	    - Learning.md: Add final takeaways.



&nbsp;       - Sync updates to Confluence:

&nbsp;           - Progress Page → final completion log

&nbsp;	    - Learning Page → final reflection summary

&nbsp;	    - Enhancements Page → carry forward improvements



12\. Session Wrap-Up

At the end of each work session:
 - Sync Jira, local documents, and Confluence.

&nbsp;- Log:

&nbsp;	Code or ticket updates

&nbsp;	New enhancements

&nbsp;	Key insights or blockers

&nbsp;- Update /JiraUpdates/Epics/<Epic\_Name>/Context.md

&nbsp;- Add a session summary in /SessionLogs/:

&nbsp;	Copy code

&nbsp;	 YYYY-MM-DD\_SessionSummary.md



📁 Folder Structure Reference

mathematica

Copy code

/DynamicWebsiteProject

│

├── Project Documents/

│   ├── Architecture.md

│   ├── Requirements.md

│   └── DesignNotes.md

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

│       ├── DYN-101\_Update.md

│       └── DYN-102\_Update.md

│

├── Confluence\_Local/

│   ├── Dynamic Website Overview.md

│   └── Epics/

│       ├── Epic1/

│       │   ├── Learning.md

│       │   ├── Progress.md

│       │   └── Enhancements.md

│

├── API\_UI\_REFERENCE.md

├── Tests/

│   ├── Scripts/

│   └── Results/

└── SessionLogs/

&nbsp;   ├── 2025-10-09\_SessionSummary.md

&nbsp;   └── ...

