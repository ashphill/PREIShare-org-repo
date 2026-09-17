# Listing Field Inventory (PREIshare)

Use this table as the source of truth when defining TypeScript types. Field names are suggestions the types may adopt; meanings, shapes, and required/optional status are mandatory and must not be loosened without updating this file and the companion domain brief.

## Identity and classification
| Field | Meaning | Shape | Required? | Example / allowed values |
| --- | --- | --- | --- | --- |
| id | Stable unique identifier for the listing | text | yes | `lst_1001` |
| title | Short name shown to investors | text | yes | `Riverfront Multifamily Offering` |
| description | Longer investor-facing summary of the opportunity | text | yes for `published`, `under_offer`, `sold` | `Value-add asset near transit...` |
| status | Lifecycle state of the listing | fixed choice (closed list) | yes | `draft`, `published`, `under_offer`, `sold`, `archived` — no other values |
| propertyType | Asset class / property classification | fixed choice (closed list) | yes | `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, `land` — no other values |
| createdAt | When the listing record was created | datetime text | yes | `2026-03-01T10:00:00Z` |
| updatedAt | Timestamp of the last meaningful edit | datetime text | yes | `2026-03-15T16:30:00Z` |

## Address (nested object — not a flat string)
| Field | Meaning | Shape | Required? | Example |
| --- | --- | --- | --- | --- |
| address.line1 | Street number and name | text | yes | `500 River Rd` |
| address.line2 | Unit/suite/floor, if any | text | no | `Suite 200` |
| address.city | City | text | yes | `Austin` |
| address.region | State / province / region | text | yes | `TX` |
| address.postalCode | Postal / ZIP code | text | yes | `78701` |
| address.country | Country code or name | text | yes | `US` |

## Financial summary (nested object)
| Field | Meaning | Shape | Required? | Example |
| --- | --- | --- | --- | --- |
| financials.askingPrice | Listed price amount | number | yes | `12500000` |
| financials.currency | Currency code for the asking price | fixed choice / text code | yes | `USD` |
| financials.projectedIrrPercent | Optional projected internal rate of return | number | no | `12.5` |
| financials.capRatePercent | Optional capitalization rate | number | no | `5.8` |

## Investor contacts (list of nested objects — array, not a single object)
| Field | Meaning | Shape | Required? | Example |
| --- | --- | --- | --- | --- |
| contacts[].name | Person or firm name | text | yes (per contact) | `Jordan Lee` |
| contacts[].role | Why this contact appears on the listing | fixed choice or text | yes (per contact) | `broker`, `owner_rep` |
| contacts[].email | Email address, if used | text | at least one of email/phone required (per contact) | `jordan@example.com` |
| contacts[].phone | Phone number, if used | text | at least one of email/phone required (per contact) | `+1-512-555-0142` |

A `published`, `under_offer`, or `sold` listing must have at least one entry in `contacts[]`.

## Ownership (list of nested objects, tied to contacts)
| Field | Meaning | Shape | Required? | Example |
| --- | --- | --- | --- | --- |
| ownership[].contactNameOrId | Which contact this ownership row refers to | text | yes (per row) | `Jordan Lee` or a contact id |
| ownership[].relationship | Relationship of the contact to the asset | fixed choice (closed list) | yes (per row) | `primary_owner`, `co_owner`, `broker`, `property_manager` — no other values |
| ownership[].sharePercent | Optional ownership share, as a percentage | number | no | `60` |

## Inventory rules (must hold for any implementation)
1. Do not invent extra top-level groups beyond identity, address, financials, contacts, and ownership without first updating the domain brief.
2. `status` and `propertyType` must remain closed lists (implemented as TypeScript union types later) — never free text, never an open string type.
3. `address` and `financials` are nested objects, not flat optional strings and not a single concatenated field.
4. `contacts` is a list (array); a valid `published`, `under_offer`, or `sold` listing requires at least one entry.
5. `ownership` entries reference a contact and use a closed-list relationship value — never a free-text description of the relationship.
6. Every required field listed above must appear in later TypeScript interfaces unless a documented decision record deliberately relaxes that requirement.