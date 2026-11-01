# OBJECT-ORIENTED PROGRAMMING (OOP) VIVA GUIDE
## Book-Shop Automation System (BAS) — College SAD Project Viva Reference

This document maps all foundational Object-Oriented Programming (OOP) concepts directly to the concrete TypeScript classes, methods, and architectural designs implemented in the BAS codebase.

---

### Quick Reference Matrix for Viva Examiner

| OOP Principle | TypeScript Implementation File | Class / Interface | Key Method / Feature |
| :--- | :--- | :--- | :--- |
| **1. Classes & Objects** | [`book.model.ts`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/models/book.model.ts) | `class Book` | Entity constructors, instance state (`new Book(...)`) |
| **2. Encapsulation** | [`book.model.ts`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/models/book.model.ts) | `class Book` | Private fields `_stockQuantity`, `sellCopies()`, `receiveCopies()` |
| **3. Inheritance** | [`user.model.ts`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/models/user.model.ts) | `User` &rarr; `Staff` &rarr; `SalesClerk`, `Manager` | Hierarchical role specialization & permission checking |
| **4. Polymorphism** | [`report.model.ts`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/models/report.model.ts) | `ReportGenerator<TReport, TParams>` | `abstract generate(...)` overridden by 3 report generators |
| **5. Abstraction** | [`book.service.ts`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/services/book.service.ts), [`storage.service.ts`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/services/storage.service.ts) | Angular Services | Hides data serialization, math, and filtering from UI components |
| **6. High Cohesion** | Feature Services | `SalesService`, `InventoryService`, `RequestService` | Each class has a single, tightly-focused business responsibility |
| **7. Low Coupling** | [`report.service.ts`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/services/report.service.ts) | Dependency Injection | Components communicate via typed service interfaces without direct dependency |

---

### Detailed Explanations for College Viva

#### 1. Classes and Objects
- **Viva Definition**: A *class* is a blueprint defining the state (properties) and behavior (methods) of a domain concept. An *object* is a concrete runtime instance of that class.
- **In BAS**:
  - Located in: [`src/app/core/models/book.model.ts`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/models/book.model.ts)
  - Concrete domain classes: `Book`, `Publisher`, `Sale`, `SaleItem`, `BookRequest`, `BookEnquiry`, `Inventory`.
  - When the app initializes or loads from storage, objects are constructed via `new Book(...)` and `new Sale(...)`.
  - Unlike naive Angular apps that rely solely on flat interfaces, BAS objects possess active behavior, validation logic, and calculated properties.

#### 2. Encapsulation (Information Hiding & Invariant Protection)
- **Viva Definition**: Encapsulation is the practice of restricting direct access to an object's internal components, exposing controlled public methods to enforce business rules and invariants.
- **In BAS**:
  - Located in: [`src/app/core/models/book.model.ts`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/models/book.model.ts)
  - Fields such as `private _stockQuantity: number`, `private _price: number`, and `private _requestCount: number` are strictly marked `private`.
  - No Angular component can arbitrarily change stock. Stock can only be mutated through the guarded methods:
    ```typescript
    sellCopies(quantity: number): void {
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error('Invalid sale quantity. Must be a positive integer.');
      }
      if (quantity > this._stockQuantity) {
        throw new Error(`Insufficient stock for "${this._title}".`);
      }
      this._stockQuantity -= quantity;
    }
    ```
  - This guarantees that stock can never become negative or fractional under any circumstances.

#### 3. Inheritance (Code Reuse & Specialization)
- **Viva Definition**: Inheritance allows a derived class to inherit state and behaviors from a base class while adding specialized properties or overriding specific capabilities.
- **In BAS**:
  - Located in: [`src/app/core/models/user.model.ts`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/models/user.model.ts)
  - Class Hierarchy:
    ```text
                 User (Abstract Base)
                /                    \
     CustomerUser                     Staff (Abstract)
                                     /                 \
                          SalesClerk                     Manager
    ```
  - Shared behaviors (such as `id`, `name`, `role`) reside in `User`.
  - `Staff` introduces `_staffId` and `_department`.
  - `SalesClerk` overrides `hasPermission()` to allow counter billing (`PROCESS_SALES`, `LOOKUP_ISBN`) while rejecting administrative operations (`UPDATE_PRICE`, `MANAGE_BOOKS`, `VIEW_MANAGEMENT_REPORTS`).
  - `Manager` overrides `hasPermission()` to return `true` for all store operations.

#### 4. Polymorphism (One Interface, Multiple Implementations)
- **Viva Definition**: Polymorphism allows objects of different classes to respond to the same method invocation, each executing behavior tailored to its specific type.
- **In BAS**:
  - Located in: [`src/app/core/models/report.model.ts`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/models/report.model.ts)
  - The generic abstract class defines a polymorphic contract:
    ```typescript
    export abstract class ReportGenerator<TReport, TParams = void> {
      abstract readonly reportType: string;
      abstract readonly reportTitle: string;
      abstract generate(context: ReportContext, params?: TParams): TReport;
    }
    ```
  - Three distinct concrete subclasses implement this contract polymorphically:
    1. `SalesReportGenerator`: Filters sales by date range, computes aggregate copies sold and total revenue.
    2. `DemandReportGenerator`: Sorts catalogue titles by customer enquiry request counts.
    3. `ReorderReportGenerator`: Applies the Case Study 11 formula ($\text{Sales}_{14d} \times \text{LeadDays}$), detects stock deficits, and formats publisher postal addresses.
  - In [`ReportService`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/services/report.service.ts), each report is generated by delegating to its respective polymorphic subclass instance.

#### 5. Abstraction
- **Viva Definition**: Abstraction hides internal complexity and low-level details, presenting consumers with a clean, high-level interface.
- **In BAS**:
  - Components do not know how data is saved to disk, parsed from JSON, or validated.
  - [`SalesService`](file:///Users/saidarshithanubola/Desktop/book%20shop%20automation/src/app/core/services/sales.service.ts) provides `processSale(isbn, quantity)`:
    - The POS component simply passes the ISBN and quantity.
    - Inside `SalesService`, book lookup, stock deduction, `SaleItem` instantiation, sequential receipt numbering, and `localStorage` commits happen seamlessly.

#### 6. High Cohesion
- **Viva Definition**: High cohesion means a class or module is focused strictly on a single, well-defined purpose.
- **In BAS**:
  - Instead of a single giant service handling everything, responsibilities are cleanly segregated:
    - `BookService`: Exclusively manages book records, search, and enquiry counters.
    - `PublisherService`: Exclusively manages publisher records and lead times.
    - `SalesService`: Exclusively manages POS billing transactions and sales ledger history.
    - `InventoryService`: Exclusively manages stock unit auditing and reorder threshold evaluations.
    - `RequestService`: Exclusively manages customer requests for unavailable books.
    - `StorageService`: Exclusively manages raw LocalStorage persistence and rehydration.

#### 7. Low Coupling
- **Viva Definition**: Low coupling means components and classes minimize direct dependencies on each other's internal structures, communicating via clean public interfaces and dependency injection.
- **In BAS**:
  - Angular Dependency Injection (`inject()`) decouples service instantiation from service usage.
  - UI components depend on abstract service observables (`books$`, `sales$`) rather than concrete storage mechanisms.
  - LocalStorage can be replaced by an indexedDB engine or future REST client without altering a single line of component template code.

