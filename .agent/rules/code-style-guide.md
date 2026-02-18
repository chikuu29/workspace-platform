---
trigger: always_on
---

* Make sure all the code is styled with PEP 8 style guide
* Make sure all the code is properly commented
* Make sure all the code are optimize memory efficent 


React (Latest Version) Rules
✅ Core Standards

Use React (latest stable)

Use TypeScript (strict mode)

Use functional components only

No class components

Use ES modules

Enable strict mode

✅ Performance & Memory Efficiency

Mandatory:

Avoid unnecessary re-renders

Use React.memo for pure components

Use useCallback for stable functions

Use useMemo for heavy computations

Use lazy loading for pages

Use code splitting

Cleanup side effects

Avoid inline object creation in JSX

Avoid anonymous functions inside JSX when possible

Example:

const handleClick = useCallback(() => {
  console.log("Clicked");
}, []);

✅ State Management Rules

Keep state minimal.

Avoid unnecessary global state.

Use context carefully.

Normalize large datasets.

Avoid deeply nested state objects.

3️⃣ Chakra UI (Latest Version) Rules
🎨 Modern Optimized UI Standard (MANDATORY)

All UI must follow a:

Clean, Modern, Minimal, Performance-Optimized Design System