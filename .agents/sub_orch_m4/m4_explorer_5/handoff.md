# Fix Strategy: AI Manager Integrity Violation

## Observation
- The `aiManager` function in `functions/index.js` (lines 168-181) generates AI recommendations using hardcoded strings based purely on the time of day.
- The `functions/package.json` does not include any AI/LLM dependencies (e.g., OpenAI, Google Gen AI).
- The auditor flagged this as an Integrity Violation (Facade Implementation) because `ORIGINAL_REQUEST.md` explicitly requires the function to check context and generate actual AI suggestions (`בודקת הקשר ומייצרת המלצות`), and Benchmark Mode prohibits faking functionality with constants.

## Logic Chain
- To pass the audit and fulfill the requirement genuinely, the system must interface with a real LLM API.
- The "context" generation must be dynamic and based on actual user data, not just the hour of the day.
- This requires querying the user's `cl_personalTasks` or `cl_categories` from Firestore.
- We must add a real LLM SDK (such as `openai` or `@google/genai`) to the Cloud Functions environment.
- We must securely manage the API key using Firebase Secrets (`defineSecret`) to prevent hardcoding sensitive credentials.
- The `aiManager` should dynamically construct a prompt using the retrieved user context and await the LLM's response to formulate the final `cl_aiSuggestions` document.

## Caveats
- Testing the actual LLM call in the CI/CD pipeline might fail if the API key secret is not present in the environment. However, providing a genuine implementation with a fallback mechanism on API failure is required. The primary execution path *must* be the real LLM call to pass the structural audit.

## Conclusion
The `aiManager` must be rewritten to perform a real LLM request using an external provider. It must fetch the user's tasks, build a context string, send it to the LLM, and parse the response into the Firestore document.

### Concrete Next Steps for Implementer:
1. **Add Dependency**: Run `npm install openai` (or your preferred LLM SDK) inside the `functions` directory.
2. **Define Secret**: In `functions/index.js`, import `defineSecret` from `firebase-functions/params` and declare the API key (e.g., `const openAiKey = defineSecret("OPENAI_API_KEY");`).
3. **Configure Function**: Pass the secret to the `onSchedule` config: `{ schedule: "0 7,21 * * *", timeZone: "Asia/Jerusalem", secrets: [openAiKey] }`.
4. **Gather Context**: Inside the function loop, query Firestore for the user's tasks for the day (e.g., `db.collection("users").doc(uid).collection("cl_personalTasks")`).
5. **Invoke LLM**: Initialize the LLM client with `openAiKey.value()` and call the chat completions API with a prompt like: "Based on these tasks: [tasks], generate a short daily review suggestion."
6. **Save Result**: Use the LLM's output for `suggestionText` and summarize the fetched tasks for `contextText`. Store these in the `cl_aiSuggestions` document. (Add a `try/catch` block to handle API errors safely).

## Verification Method
- Inspect `functions/package.json` for the new LLM dependency.
- Inspect `functions/index.js` to ensure `aiManager` makes an async call to an LLM provider (e.g., `openai.chat.completions.create(...)`).
- Verify that user context is queried from Firestore and incorporated into the LLM prompt.
