# Synthesized Strategy: Milestone 4 (Iteration 2)

## Context
Iteration 1 was rejected by the Forensic Auditor due to an INTEGRITY VIOLATION in `functions/index.js` where the `aiManager` cloud function used a facade (hardcoded strings based on time of day) instead of genuine AI contextual generation.

## Consensus Findings
1. **Genuine AI Integration (`functions/index.js`):**
   - **Current State:** The function stubs the output logic.
   - **Action:** Integrate a real LLM. Use `@google/generative-ai` (Gemini API) since it aligns with the project ecosystem. Add this dependency to `functions/package.json`.
2. **Context Gathering:**
   - **Action:** Before calling the LLM, the `aiManager` function MUST query Firestore (`cl_personalTasks`, `cl_categories`, etc.) for the specific user's upcoming tasks and events. Construct a prompt containing this data so the LLM output is genuinely contextualized.
3. **Execution and Storage:**
   - **Action:** Invoke the Gemini model with the context prompt, parse the recommendation, and save the result into `cl_aiSuggestions` with `status: 'pending'`.
4. **Other Milestone 4 requirements:**
   - The UI and Recurrence logic were completed in Iteration 1 and do not need to be rewritten, but ensure the new function correctly writes documents that the `CommandCenterView.jsx` can consume.

## Output for Worker
The Worker must execute the above fix genuinely. Do not use hardcoded outputs or facades. Ensure the function builds properly (`npm run build` in the functions directory if needed, or deploying logic). The Forensic Auditor will verify this again.
