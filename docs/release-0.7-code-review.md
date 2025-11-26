# Release 0.7 – Code Review Notes

## Scope
The review targeted the prospect workflow introduced in the 0.7.0 release (drag-and-drop pipeline, status updates, and deletion flows) to mitigate user-visible inconsistencies before production rollout.

## Findings and Actions
- **Pipeline deletion left stale cards**: Deleting a prospect from the pipeline view triggered the global delete mutation and refreshed the list view only. The pipeline state in the UI was not refreshed, so users would continue seeing the deleted card until a manual reload or navigation change. The delete handler now refreshes the pipeline data after the mutation to keep the board in sync without user intervention.

## Recommendations
- Run the frontoffice build in CI to catch regressions across the recent prospect refactor and drag-and-drop changes.
- Smoke-test the pipeline view (create, drag between stages, delete) on staging to verify status transitions stay aligned with API enums.