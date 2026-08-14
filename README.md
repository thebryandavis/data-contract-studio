# Data Contract Studio

A working prototype for defining product events, ownership, privacy, and validation before implementation.

This explores a product question: can one shared event contract keep product, engineering, analytics, and privacy decisions aligned before data starts moving?

## What it demonstrates

- Event and property definitions
- Ownership and privacy classification
- Validation checks and implementation readiness
- Generated payload examples
- A small contract export flow

The examples are synthetic. The studio is a product experiment, not a replacement for a warehouse, schema registry, or governance program.

## Run it

```bash
npm install
npm run dev
```

## What remains unproven

The next test would be whether teams actually use the contract before shipping an event, and whether that reduces broken tracking and ambiguous metrics later.
