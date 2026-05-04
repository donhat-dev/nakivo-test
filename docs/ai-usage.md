# AI Usage

## Purpose

This file records how AI is intended to support work in this repository.
It is not a substitute for code review, security review, or functional verification.

## Allowed use

AI can be used to help with:

- researching Odoo 19 conventions and official documentation
- scaffolding repository guidance files such as `AGENTS.md` and instruction files
- drafting architecture, API, and security documentation
- proposing code structure, controller contracts, and test cases
- reviewing diffs for consistency and missing edge cases

## Required human verification

A human should verify at least the following before relying on generated output:

- Odoo-version-specific APIs and decorators
- security-sensitive controller logic
- record rules, ACLs, and `sudo()` usage
- manifest assets and loading order
- final endpoint behavior in a live Odoo environment

## Documentation policy

Transient chat prompts should not become the repository's canonical context.
Stable decisions belong in local docs such as:

- `docs/conventions.md`
- `docs/design.md`
- `docs/api.md`
- `docs/security.md`

## Current use in this repo

AI has been used here to:

1. research Odoo 19 coding, security, assets, Owl, and testing conventions
2. initialize a neutral `AGENTS.md`
3. create minimal instruction files for addon code and docs
4. draft the first local conventions, frontend design, API, and security notes

## Review principle

If AI output conflicts with actual Odoo behavior, verified code and official documentation win every time.
