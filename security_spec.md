# Security Specification - Experts of Graphics System

## 1. Data Invariants
- An attendance record must belong to a valid user.
- Financial transactions must be created by a manager or supervisor.
- System settings can only be modified by the primary admin account.
- Project notes can be added by anyone but only deleted by managers.

## 2. The "Dirty Dozen" Payloads (Attacks)
Below are payloads that MUST be rejected by the rules.

| Attack ID | Description | Targeted Collection | Payload Example |
|-----------|-------------|---------------------|-----------------|
| ATK-01 | Self-assigning Manager role | `/users/{uid}` | `{ role: 'manager' }` by non-manager |
| ATK-02 | Spoofing ownerId | `/transactions` | `{ createdBy: 'other_uid' }` |
| ATK-03 | Large ID injection | `/offices` | ID = `a`.repeat(1500) |
| ATK-04 | Terminal state skip | `/projects` | `{ status: 'completed' }` without approval |
| ATK-05 | Negative amount | `/transactions` | `{ amount: -100 }` |
| ATK-06 | Admin setting spoof | `/system/settings` | `{ companyName: 'Hacker Corp' }` |
| ATK-07 | Orphaned attendance | `/attendance` | Missing required `userId` |
| ATK-08 | Unauthorized read | `/users/{uid}` | Read any user profile email |
| ATK-09 | Fake GPS check-in | `/attendance` | `{ location: { lat: 0, lng: 0 } }` far from office |
| ATK-10 | Shadow field injection | `/offices` | `{ name: 'HQ', isVerified: true }` |
| ATK-11 | Future timestamp | `/attendance` | `{ checkIn: '2027-01-01...' }` |
| ATK-12 | Bulk deletion attempt | `/*` | Delete whole collection |

## 3. Test Runner (Draft)
A `firestore.rules.test.ts` will be implemented to verify these denials.
