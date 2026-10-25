# Sahayyak AI — Database Architecture & Schema

## 1. Overview
The database layer is managed using **SQLAlchemy ORM** supporting both **SQLite** (for effortless zero-configuration local development) and **PostgreSQL** (for production deployments).

## 2. Entity Relationship Diagram (ERD)

```
       ┌────────────────┐                  ┌───────────────────┐
       │     users      │                  │    categories     │
       ├────────────────┤                  ├───────────────────┤
       │ id (PK)        │                  │ id (PK)           │
       │ name           │                  │ name              │
       │ email (Unique) │                  │ name_hi           │
       │ password_hash  │                  │ name_mr           │
       │ preferred_lang │                  │ slug (Unique)     │
       │ text_size      │                  │ icon              │
       │ is_admin       │                  │ display_order     │
       └───────┬────────┘                  └─────────┬─────────┘
               │                                     │
       1:N     │                      1:N            │
       ┌───────┴────────┐             ┌──────────────┴─────────┐
       │  saved_guides  │             │         guides         │
       ├────────────────┤  N:1        ├────────────────────────┤
       │ id (PK)        │────────────▶│ id (PK)                │
       │ user_id (FK)   │             │ category_id (FK)       │
       │ guide_id (FK)  │             │ title                  │
       │ created_at     │             │ title_hi / title_mr    │
       └────────────────┘             │ description            │
                                      │ difficulty             │
       ┌────────────────┐             │ steps_json             │
       │ conversations  │             │ safety_tips_json       │
       ├────────────────┤             │ tags                   │
       │ id (PK)        │             └────────────────────────┘
       │ user_id (FK)   │
       │ title          │
       └───────┬────────┘
               │ 1:N
       ┌───────┴────────┐
       │    messages    │
       ├────────────────┤
       │ id (PK)        │
       │ conv_id (FK)   │
       │ role           │
       │ content        │
       │ steps_json     │
       │ safety_warning │
       └────────────────┘
```

## 3. Pre-Seeded Guides
The database is auto-seeded with 10–20 comprehensive guides covering:
* Connecting to Home Wi-Fi
* Sending Photos on WhatsApp
* Making WhatsApp Video Calls
* The Golden Rules of Safe UPI Payments
* Sending Money via Google Pay & PhonePe
* Enlarging Text on Smartphones
* Taking Screenshots
* Connecting Bluetooth Headphones
* Reading & Replying to Gmail
* Attaching Documents to Emails
* Avoiding Fake Customer Care Telephone Scams
* Spotting Malicious Links in SMS & WhatsApp
* Identifying Official Government `.gov.in` Websites
* Downloading Electricity & Utility Bills
* Installing & Updating Apps Safely from Google Play Store
