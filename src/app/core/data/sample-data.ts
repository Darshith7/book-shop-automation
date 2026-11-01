import { IPublisherData } from '../models/publisher.model';
import { IBookData } from '../models/book.model';
import { ISaleData } from '../models/sale.model';
import { IBookRequestData } from '../models/request.model';
import { IBookEnquiryData } from '../models/enquiry.model';

export const INITIAL_PUBLISHERS: IPublisherData[] = [
  {
    publisherId: 'PUB-001',
    name: 'Pearson India Education Services',
    fullAddress: 'Plot No. 11, Knowledge Park II, Greater Noida, Uttar Pradesh - 201310, India',
    procurementLeadDays: 5
  },
  {
    publisherId: 'PUB-002',
    name: 'O\'Reilly Media Publishing House',
    fullAddress: '1005 Gravenstein Highway North, Sebastopol, CA 95472, USA (India Dist: Connaught Place, New Delhi - 110001)',
    procurementLeadDays: 7
  },
  {
    publisherId: 'PUB-003',
    name: 'Oxford University Press India',
    fullAddress: 'YMCA Library Building, 1 Jai Singh Road, New Delhi - 110001, India',
    procurementLeadDays: 4
  },
  {
    publisherId: 'PUB-004',
    name: 'MIT Press International',
    fullAddress: 'One Broadway, 12th Floor, Cambridge, MA 02142, USA (Academic Depot: Indiranagar, Bengaluru - 560038)',
    procurementLeadDays: 10
  },
  {
    publisherId: 'PUB-005',
    name: 'Penguin Random House India',
    fullAddress: '7th Floor, Infinity Tower C, DLF Cyber City, Gurugram, Haryana - 122002, India',
    procurementLeadDays: 3
  },
  {
    publisherId: 'PUB-006',
    name: 'Tata McGraw Hill Education',
    fullAddress: 'B-4, Sector 63, Gautam Budh Nagar, Noida, Uttar Pradesh - 201301, India',
    procurementLeadDays: 6
  }
];

export const INITIAL_BOOKS: IBookData[] = [
  {
    isbn: '978-0132350884',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    publisherId: 'PUB-001',
    price: 850,
    stockQuantity: 3, // Low stock -> Will trigger Reorder Report
    requestCount: 18, // High demand
    category: 'Computer Science',
    description: 'A handbook of agile software craftsmanship and best programming practices.'
  },
  {
    isbn: '978-0262033848',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    publisherId: 'PUB-004',
    price: 1450,
    stockQuantity: 2, // Low stock -> Will trigger Reorder Report
    requestCount: 25, // High demand
    category: 'Computer Science',
    description: 'The standard comprehensive textbook on modern algorithms and data structures.'
  },
  {
    isbn: '978-0201616224',
    title: 'The Pragmatic Programmer: Your Journey To Mastery',
    author: 'Andrew Hunt, David Thomas',
    publisherId: 'PUB-001',
    price: 920,
    stockQuantity: 14,
    requestCount: 12,
    category: 'Software Engineering',
    description: 'Practical advice for modern software craftsmanship and engineering mindset.'
  },
  {
    isbn: '978-0134685991',
    title: 'Effective Java (3rd Edition)',
    author: 'Joshua Bloch',
    publisherId: 'PUB-001',
    price: 799,
    stockQuantity: 8,
    requestCount: 9,
    category: 'Computer Science',
    description: 'Definitive guide to best practices for the Java programming language.'
  },
  {
    isbn: '978-1449331818',
    title: 'Learning JavaScript Design Patterns',
    author: 'Addy Osmani',
    publisherId: 'PUB-002',
    price: 680,
    stockQuantity: 6,
    requestCount: 7,
    category: 'Web Development',
    description: 'Explore classical and modern design patterns in modern JavaScript and TypeScript.'
  },
  {
    isbn: '978-1491950296',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    publisherId: 'PUB-002',
    price: 1250,
    stockQuantity: 4, // Below reorder threshold with recent sales
    requestCount: 22,
    category: 'Systems Architecture',
    description: 'The big ideas behind reliable, scalable, and maintainable distributed data systems.'
  },
  {
    isbn: '978-0134494166',
    title: 'Clean Architecture: A Craftsman\'s Guide',
    author: 'Robert C. Martin',
    publisherId: 'PUB-001',
    price: 890,
    stockQuantity: 11,
    requestCount: 14,
    category: 'Software Engineering',
    description: 'Universal rules of software structure and architecture for enterprise applications.'
  },
  {
    isbn: '978-0131103627',
    title: 'The C Programming Language (ANSI C)',
    author: 'Brian W. Kernighan, Dennis M. Ritchie',
    publisherId: 'PUB-001',
    price: 450,
    stockQuantity: 20,
    requestCount: 8,
    category: 'Computer Science',
    description: 'The authoritative reference to C programming written by the creators of C.'
  },
  {
    isbn: '978-0070141650',
    title: 'Operating System Concepts',
    author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
    publisherId: 'PUB-006',
    price: 990,
    stockQuantity: 5,
    requestCount: 11,
    category: 'Computer Science',
    description: 'Fundamental principles of operating systems, process management, and storage.'
  },
  {
    isbn: '978-0070591165',
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    publisherId: 'PUB-006',
    price: 950,
    stockQuantity: 0, // ZERO STOCK: In catalogue but currently out of stock
    requestCount: 16,
    category: 'Database Systems',
    description: 'Comprehensive study of relational databases, SQL, indexing, and transaction management.'
  },
  {
    isbn: '978-0199535569',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    publisherId: 'PUB-003',
    price: 299,
    stockQuantity: 12,
    requestCount: 6,
    category: 'Literature',
    description: 'A classic portrayal of the Jazz Age, wealth, disillusionment, and social status.'
  },
  {
    isbn: '978-0141439518',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    publisherId: 'PUB-005',
    price: 250,
    stockQuantity: 9,
    requestCount: 5,
    category: 'Literature',
    description: 'Timeless romantic fiction highlighting manners, upbringing, morality, and marriage.'
  },
  {
    isbn: '978-0141187761',
    title: 'Nineteen Eighty-Four (1984)',
    author: 'George Orwell',
    publisherId: 'PUB-005',
    price: 320,
    stockQuantity: 7,
    requestCount: 15,
    category: 'Fiction',
    description: 'The dystopian masterpiece depicting authoritarianism, surveillance, and doublethink.'
  },
  {
    isbn: '978-0143424123',
    title: 'Ignited Minds: Unleashing the Power Within India',
    author: 'A.P.J. Abdul Kalam',
    publisherId: 'PUB-005',
    price: 275,
    stockQuantity: 18,
    requestCount: 19,
    category: 'Inspirational',
    description: 'Inspiring messages for youth on development, knowledge, and national transformation.'
  },
  {
    isbn: '978-0143416319',
    title: 'Wings of Fire: An Autobiography',
    author: 'A.P.J. Abdul Kalam, Arun Tiwari',
    publisherId: 'PUB-005',
    price: 350,
    stockQuantity: 22,
    requestCount: 30, // Highest demand in shop
    category: 'Biography',
    description: 'Autobiography of India\'s beloved Missile Man and former President Dr. A.P.J. Abdul Kalam.'
  },
  {
    isbn: '978-0198083849',
    title: 'Modern Indian History',
    author: 'Bipin Chandra',
    publisherId: 'PUB-003',
    price: 495,
    stockQuantity: 6,
    requestCount: 8,
    category: 'History',
    description: 'In-depth historical perspective on modern India and the freedom struggle.'
  }
];

// Helper to calculate recent date relative to runtime
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const INITIAL_SALES: ISaleData[] = [
  {
    saleId: 'SALE-2026-001',
    receiptNumber: 'RCP-1001',
    saleDate: daysAgo(2), // 2 days ago (within 14 days)
    clerkName: 'Priya Sharma',
    totalAmount: 1700,
    items: [
      {
        isbn: '978-0132350884',
        bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        publisherName: 'Pearson India Education Services',
        quantity: 2,
        unitPrice: 850,
        lineTotal: 1700
      }
    ]
  },
  {
    saleId: 'SALE-2026-002',
    receiptNumber: 'RCP-1002',
    saleDate: daysAgo(4), // 4 days ago (within 14 days)
    clerkName: 'Priya Sharma',
    totalAmount: 2900,
    items: [
      {
        isbn: '978-0262033848',
        bookTitle: 'Introduction to Algorithms (CLRS)',
        publisherName: 'MIT Press International',
        quantity: 2,
        unitPrice: 1450,
        lineTotal: 2900
      }
    ]
  },
  {
    saleId: 'SALE-2026-003',
    receiptNumber: 'RCP-1003',
    saleDate: daysAgo(6), // 6 days ago (within 14 days)
    clerkName: 'Priya Sharma',
    totalAmount: 2500,
    items: [
      {
        isbn: '978-1491950296',
        bookTitle: 'Designing Data-Intensive Applications',
        publisherName: 'O\'Reilly Media Publishing House',
        quantity: 2,
        unitPrice: 1250,
        lineTotal: 2500
      }
    ]
  },
  {
    saleId: 'SALE-2026-004',
    receiptNumber: 'RCP-1004',
    saleDate: daysAgo(10), // 10 days ago (within 14 days)
    clerkName: 'Priya Sharma',
    totalAmount: 1050,
    items: [
      {
        isbn: '978-0143416319',
        bookTitle: 'Wings of Fire: An Autobiography',
        publisherName: 'Penguin Random House India',
        quantity: 3,
        unitPrice: 350,
        lineTotal: 1050
      }
    ]
  },
  {
    saleId: 'SALE-2026-005',
    receiptNumber: 'RCP-0995',
    saleDate: daysAgo(25), // 25 days ago (outside 14-day reorder window, but available for broader sales statistics)
    clerkName: 'Priya Sharma',
    totalAmount: 920,
    items: [
      {
        isbn: '978-0201616224',
        bookTitle: 'The Pragmatic Programmer: Your Journey To Mastery',
        publisherName: 'Pearson India Education Services',
        quantity: 1,
        unitPrice: 920,
        lineTotal: 920
      }
    ]
  }
];

export const INITIAL_REQUESTS: IBookRequestData[] = [
  {
    requestId: 'REQ-2026-01',
    title: 'Structure and Interpretation of Computer Programs (SICP)',
    author: 'Harold Abelson, Gerald Jay Sussman',
    publisherDetails: 'MIT Press (ISBN: 978-0262510875)',
    additionalDetails: 'Requested for University Semester 4 Advanced Functional Programming curriculum.',
    requestDate: daysAgo(3),
    status: 'PENDING'
  },
  {
    requestId: 'REQ-2026-02',
    title: 'Patterns of Enterprise Application Architecture',
    author: 'Martin Fowler',
    publisherDetails: 'Addison-Wesley Professional',
    additionalDetails: 'Customer left contact phone for when stock arrives.',
    requestDate: daysAgo(5),
    status: 'PENDING'
  }
];

export const INITIAL_ENQUIRIES: IBookEnquiryData[] = [
  {
    enquiryId: 'ENQ-001',
    isbn: '978-0132350884',
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    enquiryDate: daysAgo(1)
  },
  {
    enquiryId: 'ENQ-002',
    isbn: '978-0143416319',
    bookTitle: 'Wings of Fire: An Autobiography',
    enquiryDate: daysAgo(1)
  }
];

