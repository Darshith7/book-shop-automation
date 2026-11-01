# Book-Shop Automation System (BAS)
### Software Analysis & Design (SAD) Mini-Project — Case Study 11

A complete, professional, Object-Oriented Angular web application developed for **Case Study 11: Book-Shop Automation Software (BAS)**.

Designed strictly for a **physical retail bookstore with clerk-assisted counter billing**, automating inventory tracking, customer demand estimation, counter sales transactions, historical sales analysis, and daily publisher replenishment orders.

---

## 🌟 Key Project Highlights

- **Pure Frontend Architecture**: 100% browser-based single-page application (SPA). Zero external database servers, zero Spring Boot or REST API dependencies. Runs seamlessly offline in any modern browser.
- **Strict OOP TypeScript Implementation**: Fully adheres to Object-Oriented principles (Encapsulation, Inheritance, Polymorphism, Abstraction, High Cohesion, and Low Coupling). Domain entities preserve methods and invariants across reloads.
- **Three Integrated Role Experiences**:
  - **Public Customer**: Catalogue browsing, title/author search, explicit demand enquiry recording, purchase selection, unavailable book procurement requests.
  - **Sales Clerk**: Counter POS terminal, ISBN validation, atomic stock reduction, printable tax invoices, and sales transaction history.
  - **Shop Manager / Owner**: Administrative KPIs, catalogue and price updates, publisher records with lead times, customer demand report, date-range sales statistics, and daily publisher reorder reports.
- **Authentic Case Study 11 Reorder Formula**:
  $$\text{Threshold} = \text{Copies Sold in Last 14 Days} \times \text{Procurement Lead Days}$$
  Generates procurement purchase orders with calculated quantities to procure and full publisher mailing addresses.
- **Comprehensive Test Suite**: 45 executable unit and integration tests (Vitest) validating boundary conditions, negative stock prevention, and cyclomatic complexity ($V(G) = 9$).

---

## 📋 System Prerequisites

- **Node.js**: `v20.x` or higher (Tested and certified on `v24.22.0`)
- **npm**: `v10.x` or higher (Tested on `11.19.1`)
- **Modern Web Browser**: Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari

---

## 🚀 Quick Start Guide

### 1. Clone & Navigate to Project Directory
```bash
cd "book shop automation"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm start
```
The application will launch at:
👉 **`http://localhost:4200`**

### 4. Run Unit Test Suite
```bash
npm test -- --watch=false
```
Executes all 45 Vitest unit tests verifying domain models, invariant boundaries, services, and reports.

### 5. Production Build
```bash
npm run build
```
Generates an optimized production bundle inside `dist/bas-app/`.

---

## 🎭 Role Switcher & Demonstration Mode

Per college project parameters, no backend database or secure authentication is required.

To demonstrate staff workflows during your live project viva:
1. Click the **Staff Access** button located on the top-right of the navigation bar, or click the **Role** pill in the top banner.
2. Select any of the three roles:
   - **Customer (Public)**: Explores catalogue and requests books.
   - **Sales Clerk**: Processes counter billing via ISBN at `/clerk`.
   - **Store Manager / Owner**: Manages books, publishers, and runs analytical reports at `/manager`.
3. The selected role is saved into `localStorage`, and Angular route guards automatically update available links and protect administrative screens.

---

## 🔄 Resetting Demonstration Seed Data

If you create new sales or modify books during testing and want to reset the state back to the original demonstration baseline:
1. Click **Reset Seed Data** in the top navigation banner.
2. Confirm the reset dialog.
3. The system resets `localStorage` with:
   - 16 diverse books across Computer Science, Literature, History, and Business
   - 6 registered publishers with verified postal addresses and lead times
   - Past sales (both within the 14-day window and older sales)
   - Sample customer procurement requests and recorded enquiry counts

---

## 🎬 27-Step Live Viva Demonstration Workflow

Follow this sequence for your classroom presentation:

### Phase A: Customer Interaction
1. **Open the Homepage (`/`)**: View bookstore branding ("The Heritage Bookshop"), operational counter billing notice, and featured titles.
2. **Browse Catalogue (`/browse`)**: Inspect the responsive grid displaying covers, titles, authors, publishers, ISBNs, prices, and stock statuses.
3. **Search by Title**: Type `"Clean Code"` in the search bar. Observe instant filtering.
4. **Search by Author**: Switch criteria to "Author" and type `"Kalam"`. Notice *Wings of Fire* and *Ignited Minds* appear.
5. **View Book Details (`/book/978-0132350884`)**: Open *Clean Code*. Notice current stock is `3` and recorded enquiries are `18`.
6. **Explicit Availability Enquiry**: Click **"Check Availability / Enquire"**. Observe confirmation message and notice the demand counter immediately increments to `19`.
7. **Verify Idempotence**: Refresh the browser page (`F5`). Observe that the demand counter remains `19` (does not increment upon reload).
8. **Select for Purchase**: Click **"Select for Purchase"**. A modal displays: *"Book selected. Please provide ISBN 978-0132350884 to the sales clerk at the counter to complete your purchase."* (Notice: Stock is **not** deducted yet).
9. **Request Unavailable Book (`/request-book`)**: Go to Procurement Desk. Fill in details for a book the shop does not stock (*e.g., "Structure and Interpretation of Computer Programs"*). Submit and note confirmation ID.

### Phase B: Sales Clerk Counter Billing
10. **Switch to Sales Clerk**: Click **Staff Access** &rarr; Select **Sales Clerk**.
11. **Open POS Screen (`/clerk/pos-sale`)**: The clerk terminal loads.
12. **Enter Customer's Selected ISBN**: Enter `978-0132350884`. The live card displays *Clean Code* with available stock (`3`) and price (₹850).
13. **Enter Quantity**: Enter quantity `1` (or click a quick-pick shortcut).
14. **Process Sale**: Click **"Confirm Sale & Generate Receipt"**.
15. **Inspect Sales Receipt**: A modal immediately renders the official Tax Invoice containing receipt number (`RCP-1006`), date/time, ISBN, title, quantity, price (₹850), and total.
16. **Test Print Functionality**: Click **"Print Receipt"**. Notice browser print dialog opens formatted strictly for receipt paper.
17. **Verify Stock Deduction**: Return to `/browse` or check POS. *Clean Code* stock has decreased from `3` to `2`.
18. **Review Sales History (`/clerk/sales-history`)**: View the completed transaction in the sales ledger.

### Phase C: Manager / Owner Operations
19. **Switch to Manager**: Click **Staff Access** &rarr; Select **Bookshop Owner / Manager**.
20. **Manager Dashboard (`/manager`)**: Review the 7 operational KPIs (Catalogue titles, stock units, revenue, copies sold, customer queries, unavailable requests, below-threshold alert).
21. **Update Book Price (`/manager/books`)**: Find *The Pragmatic Programmer*. Click "Edit Price", change from ₹920 to ₹950. Save. Note that historical past sales in the ledger still preserve their original ₹920 price.
22. **Customer Demand Report (`/manager/demand-report`)**: Open the demand report. Titles are sorted descending by customer enquiry requests (*Wings of Fire* with 30, *Introduction to Algorithms* with 25).
23. **Sales Statistics Report (`/manager/sales-statistics`)**: Select a date range (e.g., Last 30 Days). Click "Generate Report". Review columns: Book Title, Publisher, ISBN, Copies Sold, Sales Revenue, plus Grand Totals.
24. **Generate Today's Reorder Report (`/manager/reorder-report`)**: Click **"Generate Today's Reorder Report"**.
25. **Inspect Calculated Thresholds**:
    - *Clean Code*: Sold in last 14 days = `2`, Publisher Lead Time = `5` days. $\text{Threshold} = 2 \times 5 = 10$. Current Stock = `2` ($< 10$). Copies to procure = $10 - 2 = \mathbf{8}$.
    - Displays publisher name (*Pearson India*) and full postal mailing address.
26. **Print Reorder Report**: Click **"Print Reorder Report"** to show printable PO document.
27. **Browser Refresh Persistence**: Refresh the browser (`F5`). All records, sales, price changes, and enquiries remain intact.

---

## 🏛️ Project Architecture & File Structure

```text
bookshop-automation/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   ├── book.model.ts          # Encapsulated Book entity (sell, receive, price, enquire)
│   │   │   │   ├── publisher.model.ts     # Publisher entity with postal address & lead times
│   │   │   │   ├── sale.model.ts          # Sale & SaleItem preserving historical unit prices
│   │   │   │   ├── request.model.ts       # Customer procurement requests
│   │   │   │   ├── enquiry.model.ts       # Availability enquiry log
│   │   │   │   ├── user.model.ts          # Inheritance: User -> Staff -> SalesClerk & Manager
│   │   │   │   ├── inventory.model.ts     # Mathematical threshold evaluator
│   │   │   │   └── report.model.ts        # Polymorphism: ReportGenerator hierarchy
│   │   │   ├── services/
│   │   │   │   ├── storage.service.ts     # Centralized LocalStorage with rehydration
│   │   │   │   ├── book.service.ts        # Book CRUD & search
│   │   │   │   ├── sales.service.ts       # Atomic POS sales processing
│   │   │   │   ├── publisher.service.ts   # Publisher directory
│   │   │   │   ├── inventory.service.ts   # Inventory audits & metrics
│   │   │   │   ├── request.service.ts     # Unavailable book requests
│   │   │   │   ├── report.service.ts      # Polymorphic report coordinator
│   │   │   │   └── staff-auth.service.ts  # Demo role switcher & permissions
│   │   │   ├── guards/
│   │   │   │   └── role.guard.ts          # Angular Route Guard for Clerk & Manager
│   │   │   └── data/
│   │   │       └── sample-data.ts         # Seed data (16 books, 6 publishers, sales)
│   │   ├── features/
│   │   │   ├── customer/                  # Public Customer pages (Home, Browse, Details, Request)
│   │   │   ├── clerk/                     # Sales Clerk pages (Dashboard, POS Sale, History, Receive)
│   │   │   └── manager/                   # Manager pages (Dashboard, Books, Publishers, 3 Reports)
│   │   └── shared/
│   │       ├── components/                # Navbar, ReceiptModal, RoleSwitcherModal, ConfirmDialog
│   │       └── pipes/                     # InrCurrencyPipe (₹ formatting)
│   ├── index.html
│   └── styles.css                         # Comprehensive design system with print layouts
├── DESIGN_DECISIONS.md                    # Architecture rationale & formula analysis
├── OOP_EXPLANATION.md                     # Viva reference mapping 7 OOP concepts
├── TEST_RESULTS.md                        # Verification matrix & cyclomatic complexity
└── README.md                              # Main documentation
```

---

## 📚 Viva Reference Documents

- **[`OOP_EXPLANATION.md`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/OOP_EXPLANATION.md)**: Direct mapping of Classes, Encapsulation, Inheritance, Polymorphism, Abstraction, High Cohesion, and Low Coupling to source files.
- **[`DESIGN_DECISIONS.md`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/DESIGN_DECISIONS.md)**: Architectural analysis of the physical bookshop model, zero-backend design, and reorder units formula.
- **[`TEST_RESULTS.md`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/TEST_RESULTS.md)**: Full verification matrix of 45 unit tests and McCabe cyclomatic complexity calculation.
