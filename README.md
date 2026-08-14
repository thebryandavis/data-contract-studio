# Data Contract Studio

A shared workspace for agreeing on an event's meaning, owner, privacy boundary, and validation checks before engineering implements it.

I built this around a familiar team problem: an event can be easy to instrument and still be hard to explain six months later.

## What it demonstrates

- Event and property definitions
- Ownership and privacy classification
- Checks before handoff
- A generated JSON contract
- A small export flow for sharing the decision

The catalog uses representative events. The useful part is the conversation it makes possible before the event reaches production.

## Run it

```bash
npm install
npm run dev
```

## Next question

Will a team use the contract before shipping an event, and does that reduce broken tracking and ambiguous metrics later?
