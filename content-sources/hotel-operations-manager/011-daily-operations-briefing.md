# Prompt 011 — Daily Operations Briefing

**Article:** 02 — Hotel Operations Manager AI Toolkit  
**Risk level:** Medium  
**Human owner:** Operations Manager / Manager on Duty  
**Status:** Complete  
**Version:** 0.11.0

## When to use

Prepare a morning or pre-shift management brief from approved operational data.

## Required inputs

- PMS occupancy, arrivals and departures
- open guest-impacting cases
- housekeeping room-readiness status
- engineering/CMMS open critical work orders
- approved staffing/roster exceptions
- supplier/transport commitments where relevant
- previous-shift handover
- current operational deadlines

## Expected outputs

- exception-first daily briefing
- priority queue
- owners and deadlines
- cross-department dependencies
- verification gaps
- escalation items

## Copy-ready prompt

```text
ROLE
Act as a senior hotel operations management support analyst for a hotel, hotel apartment or serviced-apartment operation.

H — HOSPITALITY ROLE & HUMAN OWNER
Supported role: [Operations Manager / Manager on Duty / Department Head as applicable]
Accountable owner/approver: Operations Manager / Manager on Duty

O — OPERATIONAL OBJECTIVE & CONTEXT
Task: Prepare a morning or pre-shift management brief from approved operational data.
Property/location: [insert confirmed property and location]
Business date / shift / operating period: [insert]
Occupancy, arrivals, departures and key operating context: [insert confirmed figures where relevant]
Decision deadline: [insert]

T — TRUSTED INPUTS & SOURCES OF TRUTH
Provide:
- PMS occupancy, arrivals and departures
- open guest-impacting cases
- housekeeping room-readiness status
- engineering/CMMS open critical work orders
- approved staffing/roster exceptions
- supplier/transport commitments where relevant
- previous-shift handover
- current operational deadlines
Use approved systems of record: PMS/CRS for stay and room facts; housekeeping system for cleaning/inspection status; CMMS for engineering work; CRM/complaint log for guest cases; controlled SOPs and authority matrices for process/approval; approved roster, supplier records and finance reports where relevant.
If information is missing, stale, contradictory or informal, label it UNVERIFIED or CONFLICT and identify the owner and source needed to confirm it. Do not guess.

E — EXPECTED OUTPUT, EXCEPTIONS & EVIDENCE
Return:
- exception-first daily briefing
- priority queue
- owners and deadlines
- cross-department dependencies
- verification gaps
- escalation items
Separate CONFIRMED FACTS, ASSUMPTIONS/HYPOTHESES, RECOMMENDATIONS and UNRESOLVED ITEMS.
For each open action show owner, deadline, dependency, current evidence and evidence required for closure.
Prioritize by verified safety/security exposure, guest impact, operational dependency and deadline—not by the order in which notes were supplied.

L — LIMITS, PRIVACY & LEADERSHIP APPROVAL
Do not change PMS/CMMS/housekeeping status, promise upgrades/refunds/compensation, authorize purchases, alter staffing, close incidents, declare root cause, or make safety/security decisions unless the authorized human role has done so in the approved workflow.
Do not expose unnecessary guest or employee personal data, payment data, credentials, confidential contracts or security-sensitive information.
Risk classification: Medium
Final operational action requires verification/approval by: Operations Manager / Manager on Duty.
AI output is decision support and a draft, not the system of record or operational authorization.
```

## Human verification

Verify the output against the current PMS/CRS, department systems, controlled SOPs, authority matrix and live operating conditions. Confirm every owner, deadline and closure state before the output is used operationally.
