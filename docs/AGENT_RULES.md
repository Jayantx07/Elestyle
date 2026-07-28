# AGENT_RULES.md
# Minimal Engineering Rules (Ponytail-inspired)

## Mission
Build the smallest correct solution that fully satisfies the request.
Every line of code must justify its existence.

---

## Decision Ladder (Always Follow)

Before writing code, stop at the first rule that solves the problem:

1. **Don't build it** if it isn't actually required.
2. **Reuse existing project code** instead of creating new code.
3. **Use the language standard library**.
4. **Use native platform/browser/framework features**.
5. **Use already-installed dependencies**.
6. **Write it in one clear expression/function** if practical.
7. **Only then create new abstractions.**

Never skip earlier steps.

---

## Core Principles

- YAGNI (You Aren't Gonna Need It)
- KISS (Keep It Simple)
- DRY (Don't Repeat Yourself)
- Prefer deletion over addition.
- Prefer configuration over code.
- Prefer composition over inheritance.
- Prefer functions over classes unless state truly requires a class.

---

## Before Writing Code

Ask yourself:

- Does this feature actually need new code?
- Does similar code already exist?
- Can I modify an existing implementation?
- Can the browser/framework already do this?
- Can one function replace five?
- Can I delete more code than I add?

---

## Code Generation Rules

DO:

- Keep files small.
- Use meaningful names.
- Return early.
- Avoid unnecessary nesting.
- Keep components focused.
- Write only the minimum API surface.
- Respect the existing architecture.
- Preserve readability.

DON'T:

- Create helper files for one-time logic.
- Introduce design patterns without need.
- Add wrappers around native APIs.
- Add utility files for two lines of code.
- Create hooks/classes/services "just in case".
- Add dependencies when existing ones solve it.
- Prematurely optimize.

---

## Safety Rules (Never Sacrifice)

Never remove or weaken:

- Validation
- Authentication
- Authorization
- Error handling
- Security
- Accessibility
- Data integrity

Minimal code must still be production-safe.

---

## Editing Existing Projects

Before changing anything:

1. Read all related files.
2. Understand the current flow.
3. Modify the smallest possible surface.
4. Avoid unnecessary refactoring.
5. Preserve coding style.

---

## Performance

Only optimize after identifying a real bottleneck.

Do not introduce:
- caching
- memoization
- workers
- queues
- background jobs

unless there is measurable evidence they are needed.

---

## Dependencies

Before installing a package ask:

1. Can native APIs do this?
2. Can current dependencies do this?
3. Is this package solving a real problem?

If not, don't install it.

---

## Output Expectations

When implementing a feature:

- Touch the fewest files possible.
- Write the fewest lines necessary.
- Avoid placeholder architecture.
- Avoid future-proofing.
- Explain briefly why the chosen solution is the simplest correct one.

---

## Anti-Patterns

Avoid:

- over-engineering
- unnecessary abstractions
- excessive folder creation
- duplicate utilities
- wrapper components
- giant configuration systems
- speculative features
- magic constants without reason

---

## Final Checklist

Before finishing:

- Can I delete code?
- Can I merge files?
- Can I reuse something?
- Can native APIs replace this?
- Is every line necessary?
- Is the solution still safe?
- Is it readable?

If yes, stop.
Do not continue polishing unnecessarily.
