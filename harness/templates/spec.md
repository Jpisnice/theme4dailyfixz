# Spec: <feature name>

- **Slug:** <slug>
- **Request:** "<the original 1-4 sentence request, verbatim>"
- **Date:** YYYY-MM-DD

## Goal

What the shopper or merchant can do when this is finished, and why it matters to the store.

## Users and moments

Who uses this (shopper on mobile, returning customer, merchant in the theme editor) and when.

## Design direction

The mood, references and brand cues this should express. Stay at the level of
intent (for example, "calm, practical, high-contrast prices") rather than exact pixels.

## Features

Each feature is a user-visible capability, not an implementation task.

1. **<Feature>**: what it does, and what "great" looks like beyond the minimum.
2. ...

## Out of scope

What we're deliberately not doing now.

## Constraints

- Block-first dialect (README "Non-negotiables"); CSS/JS in `assets/`.
- All strings translated; merchant settings use `t:` labels.
- <any store, app or data constraints>

## Sprints

Ordered so each sprint leaves the store shippable. Each sprint covers 1–3 features.

| # | Sprint | Features | Depends on |
| --- | --- | --- | --- |
| 01 | <name> | 1, 2 | – |
| 02 | <name> | 3 | 01 |

## Open questions

Things that need the store owner's input. Note the assumption made in the meantime.
