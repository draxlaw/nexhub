# TODO: Seed Admin Data to Database

## Task: Fix seed-admin.ts to create proper admin user

### Steps Completed:
- [x] Analyzed seed-admin.ts and identified issues (duplicate code, no admin user creation)
- [x] Reviewed User.model.ts to understand schema and password hashing
- [x] Fixed scripts/seed-admin.ts:
  - [x] Removed duplicate seed() function
  - [x] Added proper admin user creation (walyise@example.com / password123)
  - [x] Kept category seeding functionality

### Steps to Do:
- [ ] Run the seed script to verify it works

