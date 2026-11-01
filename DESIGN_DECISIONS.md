# DESIGN DECISIONS & ARCHITECTURAL SPECIFICATION
## Book-Shop Automation System (BAS) — Case Study 11

### 1. Executive Summary & Domain Scope

The Book-Shop Automation System (BAS) is designed to automate the internal operational and counter activities of a **physical brick-and-mortar retail bookstore**, strictly adhering to **Case Study 11** of the Software Analysis and Design (SAD) curriculum.

#### Physical Retail Bookstore vs. Online E-Commerce
A critical architectural decision was to reject generic e-commerce patterns (shopping carts, online payment gateways, shipping addresses, delivery tracking, customer sign-up). The original case study explicitly specifies:
- Customers browse or check availability in person or over the counter.
- Customers select physical books.
- A **sales clerk enters the ISBN** of the selected book at the physical POS billing counter.
- The system updates stock and prints an official sales receipt.
- Online customer checkout or automated payment gateways would fundamentally violate the domain model of Case Study 11.

---

### 2. Client-Side Persistence Architecture (Zero-Backend Constraint)

Per the course professor's explicit instructions:
1. A fully functional frontend website is sufficient.
2. No backend server (Spring Boot, Node/Express), SQL database (MySQL, PostgreSQL), or cloud database (Firebase, Supabase) is used.
3. The application runs entirely within the web browser using modern browser APIs (`localStorage`).

#### Storage Strategy & Centralization
- LocalStorage is managed through a single centralized service: [`StorageService`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/services/storage.service.ts).
- Angular components and feature modules never access `localStorage` directly.
- All domain records are versioned (`BAS_APP_STATE_V1`, version `1.0.0`).
- Malformed data or version shifts gracefully fall back to rich initial demonstration seed data.

#### The Rehydration Pattern (Restoring TypeScript OOP Instances)
A common limitation in web applications is that `JSON.parse()` restores plain JavaScript objects (`Object`), stripping away all TypeScript methods, private properties, and class prototypes.
To satisfy strict Object-Oriented criteria, `StorageService` implements the **Rehydration Pattern**:
- Every domain class implements a `toJSON()` serialization method and a `static fromJSON(data)` factory constructor.
- When `StorageService.loadState()` executes, it re-instantiates concrete class instances:
  - `Book.fromJSON(b)` &rarr; yields true `Book` instances with `sellCopies()`, `receiveCopies()`, `recordEnquiry()`.
  - `Sale.fromJSON(s)` &rarr; yields `Sale` instances with `SaleItem[]` and `calculateTotal()`.
  - `Publisher.fromJSON(p)` &rarr; yields `Publisher` instances with lead-time invariants.

---

### 3. Reorder Threshold Formula & Units Ambiguity Analysis

The case study defines the inventory threshold as follows:

> *"The inventory level required for a book is equal to the number of copies of the book sold over a period of two weeks multiplied by the available number of days it takes to procure the book from its publisher. Every day the book shop owner would give a command for the BAS to print the books which have fallen below the threshold and the number of copies to be procured along with full address of the publisher."*

#### Literal Implementation (Default Assignment Formula)
In strict accordance with the master project specification, BAS implements the literal assignment formula as the default:

$$\text{threshold} = \text{copiesSoldInLast14Days} \times \text{procurementLeadDays}$$

- **Reorder Condition**: Flagged when $\text{currentStock} < \text{threshold}$.
- **Quantity to Procure**: Calculated as $\max(0, \text{threshold} - \text{currentStock})$.

#### Analysis of the Dimensional Units Ambiguity
From an industrial operations research perspective, standard inventory control (e.g., Economic Order Quantity or Safety Stock) typically models lead-time demand as:
$$\text{Demand during Lead Time} = \left(\frac{\text{Sales in 14 days}}{14 \text{ days}}\right) \times \text{Lead Days}$$
However, the original Case Study 11 text explicitly states *"the number of copies of the book sold over a period of two weeks multiplied by the available number of days it takes to procure"*.
- Replacing this formula with a daily average would deviate from the exact case study problem statement given to students.
- Therefore, the literal assignment formula was preserved as the default calculation engine in [`Inventory.calculateThreshold()`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/models/inventory.model.ts) and [`ReorderReportGenerator`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/models/report.model.ts).
- Seed data has been tuned so that titles with rapid recent sales and longer lead times cleanly trigger the threshold (e.g., *Clean Code* and *Introduction to Algorithms*), ensuring a successful live viva demonstration.

---

### 4. Role Navigation & Staff Access Architecture

The system models three distinct user perspectives within a single unified Angular Single-Page Application (SPA):
1. **Customer**: Public catalog browsing, search by title/author, availability check, explicit enquiry recording, purchase selection, and procurement requests for unavailable books.
2. **Sales Clerk**: Counter POS billing, ISBN validation, atomic stock deduction, printable tax invoice receipt generation, and sales transaction history.
3. **Manager / Owner**: Supervisory dashboard, catalogue and price maintenance, publisher directory with lead times, customer demand reporting, sales statistics by date range, and daily reorder reports.

#### Demonstration Role Switcher vs. Secure Authentication
- Because there is no server-side session or security token provider, the application implements a dedicated **Demo Staff Access Switcher** accessible via the top navigation bar.
- This switcher updates the active demonstration user (`CustomerUser`, `SalesClerk`, `Manager`), saved into LocalStorage and guarded via Angular's `CanActivateFn` [`roleGuard`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/guards/role.guard.ts).
- This is explicitly documented as a viva simulation mechanism, not a production authentication system.

---

### 5. Transaction Safety & Invariant Guarantees

1. **Negative Stock Prevention**:
   Stock cannot drop below zero under any condition. If requested quantity exceeds `book.stockQuantity`, `book.sellCopies()` throws an error, aborting the transaction before any sale record is created or persisted.
2. **Atomic State Commit**:
   In [`SalesService.processSale()`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/services/sales.service.ts), stock decrement and sale creation occur together in memory before being committed to storage. If validation fails, neither stock nor sales history changes.
3. **Historical Price Preservation**:
   Every [`SaleItem`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/models/sale.model.ts) stores the `unitPrice` and `publisherName` at the exact time the sale occurred. If the manager subsequently changes the catalogue price of that book, past sales receipts and historical reports remain unchanged.
4. **Idempotent Enquiry Counting**:
   Merely visiting a book's detail page or refreshing the browser does **not** increment its enquiry count. The enquiry counter is incremented **only** when a customer clicks the explicit "Check Availability / Enquire" button on an in-stock title.

