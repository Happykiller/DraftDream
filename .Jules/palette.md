## 2025-12-13 - Input Component Accessibility Gaps
**Learning:** The shared `Input` component uses icon buttons for password visibility and help without ARIA labels, propagating accessibility issues to all forms (Login, Sandbox, etc.).
**Action:** Added `aria-label` to these buttons using translation keys. Future components should ensure interactive icons have explicit labels.
