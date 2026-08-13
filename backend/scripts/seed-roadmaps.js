import connectDB from '../src/config/db.js';
import logger from '../src/logger/index.js';
import { Roadmap, RoadmapStage, RoadmapTopic } from '../src/models/roadmap.model.js';

const roadmapsData = [
  {
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    description: 'Build modern, scalable web applications from interactive frontend UIs to robust backend services and databases.',
    career: 'Full Stack Web Development',
    difficulty: 'Intermediate',
    estimatedDuration: '6 Months',
    tags: ['Web Development', 'Frontend', 'Backend', 'Full Stack', 'JavaScript'],
    stages: [
      {
        title: 'Programming Fundamentals',
        description: 'Master core programming logic, control flow, problem solving, and basic computational thinking.',
        topics: [
          {
            title: 'Variables & Data Types',
            description: 'Understand value declaration, primitive types, type coercion, and variable scoping.',
            difficulty: 'Beginner',
            estimatedTime: '2 hours',
            learningObjectives: ['Declare variables with let/const', 'Understand string, number, boolean, null, undefined', 'Type conversion'],
            resources: [
              { label: 'MDN: JavaScript First Steps', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps', type: 'documentation' },
              { label: 'JS Variables Video Guide', url: 'https://www.youtube.com/watch?v=9emXNzqCKyg', type: 'video' }
            ],
            codingTopicTags: ['Basic', 'Math'],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?topic=Basic'
          },
          {
            title: 'Conditionals & Logic',
            description: 'Learn branching using if/else statements, ternary operators, and logical operators.',
            difficulty: 'Beginner',
            estimatedTime: '2 hours',
            learningObjectives: ['If-else statements', 'Switch cases', 'Logical AND, OR, NOT operators'],
            resources: [
              { label: 'MDN: Making Decisions in Code', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/conditionals', type: 'documentation' }
            ],
            codingTopicTags: ['Conditional', 'Logic'],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?topic=Conditional'
          },
          {
            title: 'Loops & Iteration',
            description: 'Repeat actions efficiently with for loops, while loops, and array iteration loops.',
            difficulty: 'Beginner',
            estimatedTime: '3 hours',
            learningObjectives: ['For and While loops', 'Break and Continue statements', 'Avoiding infinite loops'],
            resources: [
              { label: 'MDN: Loops and Iteration', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration', type: 'documentation' }
            ],
            codingTopicTags: ['Loops', 'Arrays'],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?topic=Loops'
          },
          {
            title: 'Functions & Scope',
            description: 'Write reusable code blocks, parameter passing, return values, arrow functions, and closures.',
            difficulty: 'Beginner',
            estimatedTime: '3 hours',
            learningObjectives: ['Function declarations and expressions', 'Arrow functions', 'Lexical scope and closures'],
            resources: [
              { label: 'MDN: Functions Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions', type: 'documentation' }
            ],
            codingTopicTags: ['Functions', 'Recursion'],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?topic=Functions'
          }
        ]
      },
      {
        title: 'HTML & CSS',
        description: 'Build semantic web documents and style them into beautiful, responsive web applications.',
        topics: [
          {
            title: 'Semantic HTML5',
            description: 'Structure web content properly using semantic tags, accessibility practices, and forms.',
            difficulty: 'Beginner',
            estimatedTime: '3 hours',
            learningObjectives: ['Semantic elements (header, nav, section, article, footer)', 'HTML Forms & Inputs', 'Accessibility (a11y) basics'],
            resources: [
              { label: 'MDN HTML Tutorial', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', type: 'documentation' }
            ],
            practiceType: 'none'
          },
          {
            title: 'CSS Box Model & Styling',
            description: 'Master margins, padding, borders, content sizing, and basic typography styling.',
            difficulty: 'Beginner',
            estimatedTime: '3 hours',
            learningObjectives: ['Box model components', 'Display property (block, inline, inline-block)', 'CSS Specificity and Selectors'],
            resources: [
              { label: 'CSS-Tricks Box Model Guide', url: 'https://css-tricks.com/the-css-box-model/', type: 'article' }
            ],
            practiceType: 'none'
          },
          {
            title: 'Flexbox & CSS Grid',
            description: 'Layout modern responsive user interfaces effortlessly using Flexbox and Grid layouts.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['Flex containers and items', 'Grid template columns/rows', 'Combining Flexbox and Grid'],
            resources: [
              { label: 'A Complete Guide to Flexbox', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', type: 'article' },
              { label: 'A Complete Guide to Grid', url: 'https://css-tricks.com/snippets/css/complete-guide-grid/', type: 'article' }
            ],
            practiceType: 'none'
          },
          {
            title: 'Responsive Web Design',
            description: 'Adapt web pages across desktop, tablet, and mobile screens using media queries.',
            difficulty: 'Intermediate',
            estimatedTime: '3 hours',
            learningObjectives: ['Mobile-first design', 'CSS Media Queries', 'Responsive units (rem, em, vh, vw)'],
            resources: [
              { label: 'MDN Responsive Design', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'JavaScript',
        description: 'Bring web pages to life with dynamic client-side interactivity, DOM manipulation, and modern JS features.',
        topics: [
          {
            title: 'Arrays & Objects',
            description: 'Manipulate key data structures in JavaScript using modern array and object methods.',
            difficulty: 'Beginner',
            estimatedTime: '3 hours',
            learningObjectives: ['Array methods (map, filter, reduce, find)', 'Object keys, values, destructuring', 'Spread & Rest operators'],
            resources: [
              { label: 'JavaScript Info: Array Methods', url: 'https://javascript.info/array-methods', type: 'documentation' }
            ],
            codingTopicTags: ['Arrays', 'Objects', 'Two Pointers'],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?topic=Arrays'
          },
          {
            title: 'DOM Manipulation & Events',
            description: 'Query, update, and listen to browser UI events dynamically.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['querySelector & querySelectorAll', 'Event Listeners & Event Delegation', 'Modifying CSS & DOM attributes'],
            resources: [
              { label: 'MDN: Introduction to DOM', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction', type: 'documentation' }
            ],
            codingTopicTags: ['DOM'],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?topic=DOM'
          },
          {
            title: 'Async JavaScript & Promises',
            description: 'Handle asynchronous operations, network requests, Promises, and async/await syntax.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['Event Loop & Call Stack', 'Promises & Chaining', 'Async/Await error handling'],
            resources: [
              { label: 'JavaScript Info: Async/Await', url: 'https://javascript.info/async-await', type: 'article' }
            ],
            codingTopicTags: ['Async', 'Promises'],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?topic=Async'
          },
          {
            title: 'Fetch API & AJAX',
            description: 'Make HTTP requests to server endpoints to fetch and submit JSON data.',
            difficulty: 'Intermediate',
            estimatedTime: '3 hours',
            learningObjectives: ['GET, POST, PUT, DELETE requests via fetch()', 'Handling HTTP response codes', 'Parsing JSON data'],
            resources: [
              { label: 'MDN: Using Fetch', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Git & GitHub',
        description: 'Manage version control for your codebase and collaborate with development teams using Git & GitHub.',
        topics: [
          {
            title: 'Git Core Commands',
            description: 'Track changes, create commits, review history, and inspect code diffs.',
            difficulty: 'Beginner',
            estimatedTime: '2 hours',
            learningObjectives: ['git init, add, commit, status', 'git log and diff', 'Working directory vs Staging area'],
            resources: [
              { label: 'Git Documentation', url: 'https://git-scm.com/doc', type: 'documentation' }
            ],
            practiceType: 'none'
          },
          {
            title: 'Branching & Collaboration',
            description: 'Work with branches, pull requests, merge conflicts, and GitHub remotes.',
            difficulty: 'Intermediate',
            estimatedTime: '3 hours',
            learningObjectives: ['git branch, checkout, merge', 'Resolving merge conflicts', 'GitHub Pull Requests & Code Review'],
            resources: [
              { label: 'GitHub Docs: Collaborating with PRs', url: 'https://docs.github.com/en/pull-requests', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'React',
        description: 'Build modern component-based single-page web applications with React.',
        topics: [
          {
            title: 'React Components & JSX',
            description: 'Understand JSX syntax, functional components, and props passing.',
            difficulty: 'Intermediate',
            estimatedTime: '3 hours',
            learningObjectives: ['JSX rules & expressions', 'Component decomposition', 'Props & PropTypes'],
            resources: [
              { label: 'React Official Docs', url: 'https://react.dev/learn', type: 'documentation' }
            ],
            practiceType: 'none'
          },
          {
            title: 'State & Hooks (useState, useEffect)',
            description: 'Manage component lifecycle and reactive state using core React Hooks.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['useState hook for reactive UI', 'useEffect for side effects and data fetching', 'Hook dependency arrays'],
            resources: [
              { label: 'React Dev: Reusing Logic with Hooks', url: 'https://react.dev/learn/reusing-logic-with-custom-hooks', type: 'article' }
            ],
            practiceType: 'none'
          },
          {
            title: 'React Router & Global State',
            description: 'Add client-side page routing and manage application state across component hierarchies.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['BrowserRouter, Routes, Route, Link', 'Context API / Redux Toolkit', 'Protected route guards'],
            resources: [
              { label: 'React Router Docs', url: 'https://reactrouter.com/', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Backend Development',
        description: 'Build robust server-side applications using Node.js and Express framework.',
        topics: [
          {
            title: 'Node.js Core Modules & Runtime',
            description: 'Understand Node.js event-driven architecture, NPM packages, and File System modules.',
            difficulty: 'Intermediate',
            estimatedTime: '3 hours',
            learningObjectives: ['Node.js runtime environment', 'NPM package management', 'CommonJS & ES Modules'],
            resources: [
              { label: 'Node.js Official Documentation', url: 'https://nodejs.org/en/docs/', type: 'documentation' }
            ],
            practiceType: 'none'
          },
          {
            title: 'Express.js Fundamentals',
            description: 'Set up an Express web server, define routes, request handlers, and middleware.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['Creating Express app and routes', 'Express middleware concept', 'Parsing request body and parameters'],
            resources: [
              { label: 'Express.js Getting Started', url: 'https://expressjs.com/en/starter/installing.html', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Databases',
        description: 'Store, query, and manage application data using relational (SQL) and NoSQL (MongoDB) databases.',
        topics: [
          {
            title: 'MongoDB & Mongoose Schema Design',
            description: 'Design Document-based collections, Schema validations, and Mongoose ORM models.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['MongoDB CRUD operations', 'Mongoose Schemas and Models', 'Indexing & References'],
            resources: [
              { label: 'Mongoose Documentation', url: 'https://mongoosejs.com/docs/guide.html', type: 'documentation' }
            ],
            practiceType: 'none'
          },
          {
            title: 'Relational Database & SQL Basics',
            description: 'Query relational tables using SELECT, JOIN, GROUP BY, and transactions.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['SQL Tables & Primary/Foreign Keys', 'INNER/LEFT JOIN queries', 'Aggregations and Indexing'],
            resources: [
              { label: 'SQL Zoo Interactive Tutorial', url: 'https://sqlzoo.net/', type: 'article' }
            ],
            practiceType: 'sql',
            practiceLink: 'coding-questions.html?topic=SQL'
          }
        ]
      },
      {
        title: 'REST APIs',
        description: 'Design and implement clean, standard RESTful web services.',
        topics: [
          {
            title: 'REST Architecture & Best Practices',
            description: 'Structure HTTP endpoints, resource paths, status codes, and JSON response formats.',
            difficulty: 'Intermediate',
            estimatedTime: '3 hours',
            learningObjectives: ['REST resource naming conventions', 'Standard HTTP status codes (200, 201, 400, 401, 404, 500)', 'Error handling format'],
            resources: [
              { label: 'REST API Tutorial', url: 'https://restfulapi.net/', type: 'article' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Authentication & Security',
        description: 'Secure user data and protect web APIs with JWT, password hashing, CORS, and sanitization.',
        topics: [
          {
            title: 'JWT Authentication & Authorization',
            description: 'Implement user login, token signing, auth middleware, and protected API routes.',
            difficulty: 'Advanced',
            estimatedTime: '4 hours',
            learningObjectives: ['Password hashing with bcrypt', 'JSON Web Token (JWT) signature & verification', 'Protected Express routes middleware'],
            resources: [
              { label: 'JWT.io Introduction', url: 'https://jwt.io/introduction', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Deployment',
        description: 'Deploy full-stack applications to cloud platforms like Vercel, Render, and AWS.',
        topics: [
          {
            title: 'Deployment & Environment Variables',
            description: 'Configure production build scripts, environment secrets, CORS, and hosting services.',
            difficulty: 'Intermediate',
            estimatedTime: '3 hours',
            learningObjectives: ['Managing .env in production', 'Vercel / Render deployment setups', 'Build optimization'],
            resources: [
              { label: 'Vercel Deployment Guide', url: 'https://vercel.com/docs', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Projects',
        description: 'Build complete end-to-end full-stack applications for your portfolio.',
        topics: [
          {
            title: 'Full Stack MERN Project',
            description: 'Build a production-ready application featuring user auth, database persistence, and API integration.',
            difficulty: 'Advanced',
            estimatedTime: '15 hours',
            learningObjectives: ['Connecting React frontend to Express backend', 'State management & loading indicators', 'Full CRUD feature set'],
            resources: [
              { label: 'CareerPrepHub Project Explorer', url: '/pages/project-explorer.html', type: 'article' }
            ],
            practiceType: 'project',
            practiceLink: 'project-explorer.html'
          }
        ]
      },
      {
        title: 'Interview Preparation',
        description: 'Prepare for technical interviews with DSA problem solving, system design, and mock questions.',
        topics: [
          {
            title: 'Data Structures & Algorithmic Practice',
            description: 'Solve core interview coding questions across Arrays, Strings, Trees, and Dynamic Programming.',
            difficulty: 'Advanced',
            estimatedTime: '20 hours',
            learningObjectives: ['Time and Space complexity (Big O)', 'Common algorithmic patterns', 'Coding interview readiness'],
            resources: [
              { label: 'CareerPrepHub Coding Questions', url: '/pages/coding-questions.html', type: 'article' }
            ],
            codingTopicTags: ['Arrays', 'Strings', 'Trees', 'Dynamic Programming', 'Two Pointers'],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html'
          }
        ]
      }
    ]
  },
  {
    title: 'Java Developer',
    slug: 'java-developer',
    description: 'Master Java enterprise development, object-oriented design, Data Structures, Spring Boot microservices, and SQL databases.',
    career: 'Backend Java Development',
    difficulty: 'Intermediate',
    estimatedDuration: '6 Months',
    tags: ['Java', 'Backend', 'Spring Boot', 'OOP', 'SQL'],
    stages: [
      {
        title: 'Programming Fundamentals',
        description: 'Learn fundamental logic, compilation flow, and basic syntax of statically typed languages.',
        topics: [
          {
            title: 'Problem Solving & Logic',
            description: 'Deconstruct real-world problems into pseudo-code and algorithmic logic.',
            difficulty: 'Beginner',
            estimatedTime: '3 hours',
            learningObjectives: ['Flowcharts and algorithm design', 'Dry running code logic', 'Basic math and logic problems'],
            resources: [
              { label: 'GeeksforGeeks Programming Fundamentals', url: 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/', type: 'article' }
            ],
            codingTopicTags: ['Basic', 'Math'],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?language=java'
          }
        ]
      },
      {
        title: 'Java Basics',
        description: 'Write your first Java program, understand the JVM, JDK, primitives, and syntax.',
        topics: [
          {
            title: 'JDK, JVM & Syntax',
            description: 'Understand how Java compiles source code to Bytecode and runs on the JVM.',
            difficulty: 'Beginner',
            estimatedTime: '3 hours',
            learningObjectives: ['JDK vs JRE vs JVM', 'Public static void main() entry point', 'Primitive data types & wrapper classes'],
            resources: [
              { label: 'Oracle Java Documentation', url: 'https://docs.oracle.com/en/java/', type: 'documentation' }
            ],
            practiceType: 'none'
          },
          {
            title: 'Control Flow & Arrays',
            description: 'Control program execution with conditionals, loops, and 1D/2D arrays.',
            difficulty: 'Beginner',
            estimatedTime: '4 hours',
            learningObjectives: ['If/Else & Switch expressions', 'For, While, and Enhanced For loops', 'Array allocation & traversal'],
            resources: [
              { label: 'Baeldung: Java Arrays', url: 'https://www.baeldung.com/java-arrays', type: 'article' }
            ],
            codingTopicTags: ['Arrays'],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?language=java&topic=Arrays'
          }
        ]
      },
      {
        title: 'OOP',
        description: 'Master Object-Oriented Programming principles: Encapsulation, Inheritance, Polymorphism, and Abstraction.',
        topics: [
          {
            title: 'Classes, Objects & Constructors',
            description: 'Design custom Java classes, instantiate objects, and use constructors.',
            difficulty: 'Beginner',
            estimatedTime: '3 hours',
            learningObjectives: ['Class design & instance variables', 'Constructor overloading & this keyword', 'Access modifiers (public, private, protected)'],
            resources: [
              { label: 'Oracle OOP Concepts', url: 'https://docs.oracle.com/javase/tutorial/java/concepts/', type: 'documentation' }
            ],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?language=java'
          },
          {
            title: 'Inheritance, Polymorphism & Interfaces',
            description: 'Build object hierarchies using extends, implements, method overriding, and abstract classes.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['Method overriding vs overloading', 'Abstract classes vs Interfaces', 'Dynamic method dispatch'],
            resources: [
              { label: 'Baeldung: Interfaces vs Abstract Classes', url: 'https://www.baeldung.com/java-interface-default-method-vs-abstract-class', type: 'article' }
            ],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?language=java'
          }
        ]
      },
      {
        title: 'Collections Framework',
        description: 'Utilize Java Collections for dynamic data management: List, Set, Map, Queue, and Iterators.',
        topics: [
          {
            title: 'List, Set & Map Interfaces',
            description: 'Choose the optimal collection: ArrayList, LinkedList, HashSet, TreeSet, HashMap, and TreeMap.',
            difficulty: 'Intermediate',
            estimatedTime: '5 hours',
            learningObjectives: ['ArrayList vs LinkedList performance', 'HashMap hashing mechanism & equals/hashCode', 'Set uniqueness guarantees'],
            resources: [
              { label: 'Baeldung: Java Collections Guide', url: 'https://www.baeldung.com/java-collections', type: 'article' }
            ],
            codingTopicTags: ['Hash Table', 'Arrays'],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?language=java'
          }
        ]
      },
      {
        title: 'Exception Handling',
        description: 'Write resilient Java code using checked/unchecked exceptions and try-with-resources.',
        topics: [
          {
            title: 'Exceptions & File I/O',
            description: 'Handle runtime errors gracefully and manage system resources.',
            difficulty: 'Intermediate',
            estimatedTime: '3 hours',
            learningObjectives: ['Checked vs Unchecked Exceptions', 'Try-Catch-Finally and Try-with-resources', 'Custom Exception classes'],
            resources: [
              { label: 'Oracle Exception Handling', url: 'https://docs.oracle.com/javase/tutorial/essential/exceptions/', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Java 8+',
        description: 'Leverage modern Java features including Streams API, Lambda Expressions, and Optional.',
        topics: [
          {
            title: 'Lambdas, Streams & Optional',
            description: 'Write concise functional code using stream operations like filter, map, collect, and reduce.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['Functional Interfaces (@FunctionalInterface)', 'Stream API operations (map, filter, reduce, collect)', 'Avoiding NullPointerException with Optional'],
            resources: [
              { label: 'Baeldung: Java 8 Streams', url: 'https://www.baeldung.com/java-8-streams', type: 'article' }
            ],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?language=java'
          }
        ]
      },
      {
        title: 'DSA',
        description: 'Implement fundamental Data Structures and Algorithms in Java for coding interviews.',
        topics: [
          {
            title: 'Data Structures in Java',
            description: 'Implement Linked Lists, Stacks, Queues, Binary Trees, and Graphs.',
            difficulty: 'Intermediate',
            estimatedTime: '12 hours',
            learningObjectives: ['LinkedList implementation', 'Stack & Queue operations', 'Binary Search Tree traversal (Inorder, Preorder, Postorder)'],
            resources: [
              { label: 'CareerPrepHub Coding Practice', url: '/pages/coding-questions.html', type: 'article' }
            ],
            codingTopicTags: ['Linked List', 'Stack', 'Queue', 'Trees', 'Graphs'],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?language=java'
          }
        ]
      },
      {
        title: 'SQL & Databases',
        description: 'Design relational tables and write complex SQL queries for backend data persistence.',
        topics: [
          {
            title: 'RDBMS & SQL Queries',
            description: 'Execute DDL/DML statements, joins, indexing, and normalization.',
            difficulty: 'Intermediate',
            estimatedTime: '5 hours',
            learningObjectives: ['Database normalization (1NF, 2NF, 3NF)', 'Complex SQL JOINs & Subqueries', 'Database Indexing'],
            resources: [
              { label: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/', type: 'documentation' }
            ],
            practiceType: 'sql',
            practiceLink: 'coding-questions.html?topic=SQL'
          }
        ]
      },
      {
        title: 'JDBC',
        description: 'Connect Java applications directly to database systems using Java Database Connectivity.',
        topics: [
          {
            title: 'JDBC Connection & PreparedStatement',
            description: 'Execute parameterized queries safely against relational databases.',
            difficulty: 'Intermediate',
            estimatedTime: '3 hours',
            learningObjectives: ['DriverManager & Connections', 'PreparedStatement vs Statement', 'ResultSet processing'],
            resources: [
              { label: 'Oracle JDBC Basics', url: 'https://docs.oracle.com/javase/tutorial/jdbc/', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Spring / Spring Boot',
        description: 'Build enterprise-grade Java web applications with the Spring Framework ecosystem.',
        topics: [
          {
            title: 'Spring Boot, IoC & Dependency Injection',
            description: 'Understand Spring Application Context, Dependency Injection (@Autowired), and Spring Beans.',
            difficulty: 'Advanced',
            estimatedTime: '6 hours',
            learningObjectives: ['Inversion of Control (IoC) principle', 'Spring Boot Starter dependencies & autoconfiguration', '@Component, @Service, @Repository annotations'],
            resources: [
              { label: 'Spring Boot Guides', url: 'https://spring.io/guides/gs/spring-boot/', type: 'documentation' }
            ],
            practiceType: 'none'
          },
          {
            title: 'Spring Data JPA & Hibernate',
            description: 'Map Java objects to relational tables using Object-Relational Mapping (ORM).',
            difficulty: 'Advanced',
            estimatedTime: '5 hours',
            learningObjectives: ['JpaRepository & CrudRepository interfaces', 'Entity mappings (@Entity, @Table, @OneToMany, @ManyToOne)', 'JPQL & Derived query methods'],
            resources: [
              { label: 'Baeldung: Spring Data JPA', url: 'https://www.baeldung.com/the-persistence-layer-with-spring-data-jpa', type: 'article' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'REST APIs',
        description: 'Expose RESTful endpoints using Spring MVC annotations.',
        topics: [
          {
            title: 'Building RESTful Web Services in Spring Boot',
            description: 'Create API endpoints with @RestController, @GetMapping, @PostMapping, and ResponseEntity.',
            difficulty: 'Advanced',
            estimatedTime: '4 hours',
            learningObjectives: ['@RestController and @RequestMapping', '@PathVariable, @RequestParam, @RequestBody', 'Global Exception Handling with @ControllerAdvice'],
            resources: [
              { label: 'Spring Boot REST Guide', url: 'https://spring.io/guides/gs/rest-service/', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Projects',
        description: 'Build a production-quality Java Spring Boot application.',
        topics: [
          {
            title: 'Enterprise Java Microservice / Web App',
            description: 'Build a complete backend API service with Spring Boot, Spring Security, and PostgreSQL.',
            difficulty: 'Advanced',
            estimatedTime: '15 hours',
            learningObjectives: ['Spring Security JWT integration', 'Spring Data JPA ORM layer', 'RESTful API endpoints & OpenAPI/Swagger docs'],
            resources: [
              { label: 'CareerPrepHub Project Explorer', url: '/pages/project-explorer.html', type: 'article' }
            ],
            practiceType: 'project',
            practiceLink: 'project-explorer.html'
          }
        ]
      },
      {
        title: 'Interview Preparation',
        description: 'Prepare for Java developer technical rounds.',
        topics: [
          {
            title: 'Java Core & Multithreading Interview Questions',
            description: 'Master questions on JVM memory, Garbage Collection, Threads, and Concurrency.',
            difficulty: 'Advanced',
            estimatedTime: '10 hours',
            learningObjectives: ['Java Memory Model (Heap vs Stack)', 'Garbage Collection algorithms', 'Multithreading & Synchronized blocks'],
            resources: [
              { label: 'Baeldung: Java Interview Questions', url: 'https://www.baeldung.com/java-interview-questions', type: 'article' }
            ],
            practiceType: 'interview',
            practiceLink: 'tech-skills.html'
          }
        ]
      }
    ]
  },
  {
    title: 'Data Analyst',
    slug: 'data-analyst',
    description: 'Transform raw data into actionable insights using Excel, SQL queries, Python data analysis libraries, and BI dashboards.',
    career: 'Data Analysis & Business Intelligence',
    difficulty: 'Beginner',
    estimatedDuration: '5 Months',
    tags: ['Data Analysis', 'SQL', 'Python', 'Pandas', 'Power BI', 'Statistics'],
    stages: [
      {
        title: 'Mathematics Fundamentals',
        description: 'Build basic mathematical fluency required for statistical data interpretation.',
        topics: [
          {
            title: 'Basic Math & Algebra for Data Analysis',
            description: 'Understand percentages, ratios, linear equations, and rates of growth.',
            difficulty: 'Beginner',
            estimatedTime: '2 hours',
            learningObjectives: ['Ratios and Percent Change', 'Basic algebraic equations', 'Interpreting rates & scales'],
            resources: [
              { label: 'Khan Academy Math', url: 'https://www.khanacademy.org/math', type: 'documentation' }
            ],
            practiceType: 'aptitude',
            practiceLink: 'aptitude.html'
          }
        ]
      },
      {
        title: 'Excel',
        description: 'Perform data entry, formula calculations, pivot tables, and chart visual analytics in Microsoft Excel.',
        topics: [
          {
            title: 'Excel Formulas & Functions',
            description: 'Master VLOOKUP, XLOOKUP, INDEX-MATCH, IF statements, and SUMIFS.',
            difficulty: 'Beginner',
            estimatedTime: '4 hours',
            learningObjectives: ['VLOOKUP and XLOOKUP syntax', 'Nested IF statements', 'Logical functions (AND, OR)'],
            resources: [
              { label: 'Microsoft Excel Training', url: 'https://support.microsoft.com/en-us/excel', type: 'documentation' }
            ],
            practiceType: 'excel',
            practiceLink: 'domains.html'
          },
          {
            title: 'Pivot Tables & Data Summarization',
            description: 'Summarize large spreadsheets quickly using Pivot Tables, calculated fields, and Slicers.',
            difficulty: 'Beginner',
            estimatedTime: '3 hours',
            learningObjectives: ['Creating Pivot Tables', 'Grouping & Aggregations', 'Pivot Charts & Slicers'],
            resources: [
              { label: 'Excel Easy Pivot Tables Guide', url: 'https://www.excel-easy.com/data-analysis/pivot-tables.html', type: 'article' }
            ],
            practiceType: 'excel',
            practiceLink: 'domains.html'
          }
        ]
      },
      {
        title: 'SQL',
        description: 'Extract, aggregate, filter, and join business data stored in relational database tables.',
        topics: [
          {
            title: 'SQL Data Extraction & Filtering',
            description: 'Query database tables using SELECT, WHERE, ORDER BY, and LIMIT.',
            difficulty: 'Beginner',
            estimatedTime: '3 hours',
            learningObjectives: ['SELECT and Alias syntax', 'Filtering with WHERE, IN, LIKE, BETWEEN', 'Sorting results'],
            resources: [
              { label: 'Mode Analytics SQL Tutorial', url: 'https://mode.com/sql-tutorial/', type: 'documentation' }
            ],
            practiceType: 'sql',
            practiceLink: 'coding-questions.html?topic=SQL'
          },
          {
            title: 'SQL Joins & Grouping',
            description: 'Combine multiple tables using INNER/LEFT JOINs and calculate aggregates with GROUP BY and HAVING.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['INNER, LEFT, RIGHT, and FULL JOINs', 'COUNT, SUM, AVG, MIN, MAX aggregations', 'GROUP BY and HAVING clauses'],
            resources: [
              { label: 'W3Schools SQL Joins', url: 'https://www.w3schools.com/sql/sql_join.asp', type: 'documentation' }
            ],
            practiceType: 'sql',
            practiceLink: 'coding-questions.html?topic=SQL'
          }
        ]
      },
      {
        title: 'Python',
        description: 'Learn Python programming language fundamentals for data manipulation.',
        topics: [
          {
            title: 'Python Syntax & Data Structures',
            description: 'Write Python code utilizing Lists, Tuples, Dictionaries, Sets, and Control Flow.',
            difficulty: 'Beginner',
            estimatedTime: '4 hours',
            learningObjectives: ['Python Variables & Data Types', 'Lists, Dictionaries, and Sets', 'For/While loops and List Comprehensions'],
            resources: [
              { label: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'documentation' }
            ],
            practiceType: 'python',
            practiceLink: 'coding-questions.html?language=python'
          }
        ]
      },
      {
        title: 'NumPy',
        description: 'Perform high-performance numerical computing and array manipulations in Python.',
        topics: [
          {
            title: 'NumPy Arrays & Mathematical Operations',
            description: 'Work with multi-dimensional N-d arrays, vectorization, and broadcasting.',
            difficulty: 'Beginner',
            estimatedTime: '3 hours',
            learningObjectives: ['Creating NumPy arrays (np.array, np.zeros, np.arange)', 'Array slicing and indexing', 'Vectorized math operations'],
            resources: [
              { label: 'NumPy Quickstart Guide', url: 'https://numpy.org/doc/stable/user/quickstart.html', type: 'documentation' }
            ],
            practiceType: 'python',
            practiceLink: 'coding-questions.html?language=python'
          }
        ]
      },
      {
        title: 'Pandas',
        description: 'Manipulate tabular data using Pandas DataFrames and Series.',
        topics: [
          {
            title: 'Pandas DataFrames & Operations',
            description: 'Load datasets (CSV, Excel, SQL), filter rows, select columns, and calculate summary statistics.',
            difficulty: 'Intermediate',
            estimatedTime: '5 hours',
            learningObjectives: ['Reading CSV/Excel with pd.read_csv()', 'Filtering DataFrames (.loc and .iloc)', 'Groupby and aggregation functions'],
            resources: [
              { label: 'Pandas Getting Started Guide', url: 'https://pandas.pydata.org/docs/getting_started/index.html', type: 'documentation' }
            ],
            practiceType: 'python',
            practiceLink: 'coding-questions.html?language=python'
          }
        ]
      },
      {
        title: 'Data Cleaning',
        description: 'Clean dirty datasets by handling missing values, duplicates, outliers, and invalid data types.',
        topics: [
          {
            title: 'Data Wrangling & Preprocessing',
            description: 'Identify and resolve missing values (fillna, dropna), correct data formats, and handle outliers.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['Detecting missing data (.isna(), .isnull())', 'Imputing missing values vs dropping rows', 'String cleaning & Type conversions'],
            resources: [
              { label: 'Kaggle Data Cleaning Course', url: 'https://www.kaggle.com/learn/data-cleaning', type: 'article' }
            ],
            practiceType: 'python',
            practiceLink: 'coding-questions.html?language=python'
          }
        ]
      },
      {
        title: 'Data Visualization',
        description: 'Create meaningful charts using Matplotlib, Seaborn, and plotting tools.',
        topics: [
          {
            title: 'Plotting with Matplotlib & Seaborn',
            description: 'Build bar charts, line plots, histograms, scatter plots, and correlation heatmaps.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['Choosing the right chart type for data distribution', 'Customizing plot titles, labels, and palettes', 'Seaborn statistical plots (sns.heatmap, sns.boxplot)'],
            resources: [
              { label: 'Seaborn Data Visualization Tutorial', url: 'https://seaborn.pydata.org/tutorial.html', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Statistics',
        description: 'Understand core statistical metrics, probability distributions, hypothesis testing, and correlation.',
        topics: [
          {
            title: 'Descriptive & Inferential Statistics',
            description: 'Calculate Mean, Median, Mode, Standard Deviation, Variance, and P-values.',
            difficulty: 'Intermediate',
            estimatedTime: '5 hours',
            learningObjectives: ['Measures of Central Tendency & Dispersion', 'Normal Distribution & Z-scores', 'Hypothesis testing (T-tests, A/B Testing concepts)'],
            resources: [
              { label: 'Khan Academy Statistics & Probability', url: 'https://www.khanacademy.org/math/statistics-probability', type: 'article' }
            ],
            practiceType: 'statistics',
            practiceLink: 'aptitude.html'
          }
        ]
      },
      {
        title: 'Power BI / Tableau',
        description: 'Build interactive business intelligence dashboards and data reports.',
        topics: [
          {
            title: 'Building Interactive BI Dashboards',
            description: 'Import data models, write DAX calculations, create visual reports, and publish dashboards.',
            difficulty: 'Intermediate',
            estimatedTime: '6 hours',
            learningObjectives: ['Building data relationships in Power BI', 'Basic DAX functions (SUM, CALCULATE)', 'Creating interactive slicers and drill-throughs'],
            resources: [
              { label: 'Microsoft Power BI Documentation', url: 'https://learn.microsoft.com/en-us/power-bi/', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Projects',
        description: 'Complete an end-to-end data analysis portfolio project.',
        topics: [
          {
            title: 'End-to-End Business Data Analysis Project',
            description: 'Analyze a real-world dataset from raw CSV to SQL analysis, Python cleaning, and Power BI dashboard.',
            difficulty: 'Intermediate',
            estimatedTime: '12 hours',
            learningObjectives: ['Problem formulation and EDA', 'Insight generation and recommendations', 'Executive report presentation'],
            resources: [
              { label: 'CareerPrepHub Project Explorer', url: '/pages/project-explorer.html', type: 'article' }
            ],
            practiceType: 'project',
            practiceLink: 'project-explorer.html'
          }
        ]
      },
      {
        title: 'Interview Preparation',
        description: 'Prepare for Data Analyst interview rounds including SQL live coding, case studies, and statistics.',
        topics: [
          {
            title: 'SQL & Data Analysis Case Study Practice',
            description: 'Solve real interview SQL queries and business case study questions.',
            difficulty: 'Intermediate',
            estimatedTime: '8 hours',
            learningObjectives: ['Complex SQL window functions (ROW_NUMBER, RANK, LEAD, LAG)', 'Business metric calculations (Retention, Churn, LTV)', 'Explaining data findings to stakeholders'],
            resources: [
              { label: 'CareerPrepHub Aptitude & Logic', url: '/pages/aptitude.html', type: 'article' }
            ],
            practiceType: 'interview',
            practiceLink: 'aptitude.html'
          }
        ]
      }
    ]
  },
  {
    title: 'AI / ML Engineer',
    slug: 'ai-ml-engineer',
    description: 'Master artificial intelligence, machine learning algorithms, deep learning neural networks, MLOps, and Large Language Models (LLMs).',
    career: 'AI & Machine Learning Engineering',
    difficulty: 'Advanced',
    estimatedDuration: '6 Months',
    tags: ['AI', 'Machine Learning', 'Deep Learning', 'Python', 'MLOps', 'Generative AI'],
    stages: [
      {
        title: 'Python & Data Science Fundamentals',
        description: 'Master Python object-oriented programming, data structures, and mathematical vectorization.',
        topics: [
          {
            title: 'Python for Data Science & AI',
            description: 'Write efficient Python code using NumPy arrays, Pandas DataFrames, and vectorized calculations.',
            difficulty: 'Beginner',
            estimatedTime: '4 hours',
            learningObjectives: ['NumPy multi-dimensional arrays', 'Pandas data cleaning & manipulation', 'Vectorized math operations'],
            resources: [
              { label: 'Python Data Science Handbook', url: 'https://jakevdp.github.io/PythonDataScienceHandbook/', type: 'documentation' }
            ],
            practiceType: 'python',
            practiceLink: 'coding-questions.html?language=python'
          }
        ]
      },
      {
        title: 'Mathematics & Statistics for AI',
        description: 'Build mathematical fluency in Linear Algebra, Multi-variable Calculus, and Probability.',
        topics: [
          {
            title: 'Linear Algebra & Calculus',
            description: 'Understand Matrices, Vectors, Eigenvalues, Derivatives, and Gradient Descent optimization.',
            difficulty: 'Intermediate',
            estimatedTime: '6 hours',
            learningObjectives: ['Matrix multiplication & Transposition', 'Partial derivatives and Chain Rule', 'Gradient Descent optimization intuition'],
            resources: [
              { label: '3Blue1Brown: Mathematics of Machine Learning', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', type: 'video' }
            ],
            practiceType: 'statistics',
            practiceLink: 'aptitude.html'
          }
        ]
      },
      {
        title: 'Data Preprocessing & Feature Engineering',
        description: 'Prepare raw datasets for machine learning models through scaling, encoding, and feature extraction.',
        topics: [
          {
            title: 'Feature Scaling & One-Hot Encoding',
            description: 'Normalize numerical features and encode categorical variables using Scikit-Learn.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['StandardScaler vs MinMaxScaler', 'One-Hot & Label Encoding', 'Handling missing data'],
            resources: [
              { label: 'Scikit-Learn Preprocessing Guide', url: 'https://scikit-learn.org/stable/modules/preprocessing.html', type: 'documentation' }
            ],
            practiceType: 'python',
            practiceLink: 'coding-questions.html?language=python'
          }
        ]
      },
      {
        title: 'Classical Machine Learning',
        description: 'Master supervised and unsupervised ML algorithms: Regression, Classification, SVMs, Decision Trees, and Clustering.',
        topics: [
          {
            title: 'Supervised Learning Algorithms',
            description: 'Train Linear/Logistic Regression, Random Forests, XGBoost, and Support Vector Machines.',
            difficulty: 'Intermediate',
            estimatedTime: '8 hours',
            learningObjectives: ['Linear and Logistic Regression math', 'Decision Trees and Random Forest ensembles', 'Evaluating accuracy, precision, recall, and F1-score'],
            resources: [
              { label: 'Scikit-Learn User Guide', url: 'https://scikit-learn.org/stable/user_guide.html', type: 'documentation' }
            ],
            practiceType: 'python',
            practiceLink: 'coding-questions.html?language=python'
          },
          {
            title: 'Unsupervised Learning & Dimensionality Reduction',
            description: 'Discover hidden patterns with K-Means Clustering and Principal Component Analysis (PCA).',
            difficulty: 'Intermediate',
            estimatedTime: '5 hours',
            learningObjectives: ['K-Means clustering and Elbow method', 'PCA variance compression', 'Hierarchical clustering'],
            resources: [
              { label: 'StatQuest: PCA & Clustering', url: 'https://youtube.com', type: 'video' }
            ],
            practiceType: 'python',
            practiceLink: 'coding-questions.html?language=python'
          }
        ]
      },
      {
        title: 'Deep Learning Fundamentals',
        description: 'Build and train Artificial Neural Networks (ANNs) using PyTorch or TensorFlow.',
        topics: [
          {
            title: 'Neural Networks & Backpropagation',
            description: 'Understand Perceptrons, Activation Functions (ReLU, Sigmoid, Softmax), Loss Functions, and Backpropagation.',
            difficulty: 'Advanced',
            estimatedTime: '8 hours',
            learningObjectives: ['Forward pass and Loss calculation', 'Backpropagation gradient calculation', 'Optimizers (SGD, Adam)'],
            resources: [
              { label: 'PyTorch Official Tutorials', url: 'https://pytorch.org/tutorials/', type: 'documentation' }
            ],
            practiceType: 'python',
            practiceLink: 'coding-questions.html?language=python'
          }
        ]
      },
      {
        title: 'Computer Vision & Natural Language Processing',
        description: 'Process images and text using Convolutional Neural Networks (CNNs) and Transformers.',
        topics: [
          {
            title: 'CNNs for Image Recognition',
            description: 'Build image classification and object detection pipelines with PyTorch/Keras.',
            difficulty: 'Advanced',
            estimatedTime: '6 hours',
            learningObjectives: ['Convolution & Pooling layers', 'ResNet & Transfer Learning', 'Data augmentation'],
            resources: [
              { label: 'PyTorch Image Classification', url: 'https://pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html', type: 'article' }
            ],
            practiceType: 'none'
          },
          {
            title: 'NLP & Transformer Architecture',
            description: 'Understand Tokenization, Embeddings, Attention Mechanism, and Transformer models.',
            difficulty: 'Advanced',
            estimatedTime: '8 hours',
            learningObjectives: ['Word Embeddings (Word2Vec, GloVe)', 'Self-Attention and Multi-Head Attention', 'BERT & GPT architectures'],
            resources: [
              { label: 'Hugging Face Transformers Course', url: 'https://huggingface.co/learn/nlp-course', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Large Language Models & Generative AI',
        description: 'Build cutting-edge GenAI applications using LLMs, RAG, and Vector Databases.',
        topics: [
          {
            title: 'RAG (Retrieval-Augmented Generation) & LangChain',
            description: 'Connect LLMs to custom knowledge bases using Vector DBs (ChromaDB, Pinecone) and LangChain.',
            difficulty: 'Advanced',
            estimatedTime: '8 hours',
            learningObjectives: ['Prompt engineering best practices', 'Vector Indexing & Embeddings', 'RAG pipeline implementation'],
            resources: [
              { label: 'LangChain Documentation', url: 'https://python.langchain.com/docs/get_started/introduction', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'MLOps & Deployment',
        description: 'Deploy machine learning models as production REST APIs using FastAPI, Docker, and MLflow.',
        topics: [
          {
            title: 'Model Serving & Monitoring',
            description: 'Wrap ML models in FastAPI, containerize with Docker, and track model drift.',
            difficulty: 'Advanced',
            estimatedTime: '6 hours',
            learningObjectives: ['Building prediction APIs with FastAPI', 'Dockerizing ML models', 'Tracking experiments with MLflow'],
            resources: [
              { label: 'FastAPI Documentation', url: 'https://fastapi.tiangolo.com/', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Projects',
        description: 'Build a complete end-to-end Machine Learning or GenAI application.',
        topics: [
          {
            title: 'End-to-End LLM RAG Application',
            description: 'Build and deploy a full-stack Generative AI Assistant with document search, vector storage, and interactive web UI.',
            difficulty: 'Advanced',
            estimatedTime: '15 hours',
            learningObjectives: ['Embedding document chunks into Vector DB', 'Building RAG API backend', 'Frontend chat UI integration'],
            resources: [
              { label: 'CareerPrepHub Project Explorer', url: '/pages/project-explorer.html', type: 'article' }
            ],
            practiceType: 'project',
            practiceLink: 'project-explorer.html'
          }
        ]
      },
      {
        title: 'Interview Preparation',
        description: 'Prepare for AI/ML technical rounds, ML system design, and coding challenges.',
        topics: [
          {
            title: 'Machine Learning & System Design Interviews',
            description: 'Master ML interview questions, loss derivations, and ML System Design (e.g. Recommendation Systems).',
            difficulty: 'Advanced',
            estimatedTime: '10 hours',
            learningObjectives: ['Explaining trade-offs between ML algorithms', 'Designing scalable Recommendation Systems', 'Overcoming overfitting and data imbalance'],
            resources: [
              { label: 'ML Interview Guide', url: 'https://hashingvalidations.com', type: 'article' }
            ],
            practiceType: 'interview',
            practiceLink: 'tech-skills.html'
          }
        ]
      }
    ]
  },
  {
    title: 'DevOps Engineer',
    slug: 'devops-engineer',
    description: 'Master continuous integration & deployment (CI/CD), Docker containerization, Kubernetes orchestration, Infrastructure as Code (Terraform), and Cloud platforms.',
    career: 'DevOps & Cloud Engineering',
    difficulty: 'Intermediate',
    estimatedDuration: '6 Months',
    tags: ['DevOps', 'Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS'],
    stages: [
      {
        title: 'Linux & Shell Scripting',
        description: 'Master Linux command-line administration, process management, and Bash automation scripts.',
        topics: [
          {
            title: 'Linux CLI & Administration',
            description: 'Navigate Linux file systems, manage file permissions (chmod, chown), processes, and package managers.',
            difficulty: 'Beginner',
            estimatedTime: '4 hours',
            learningObjectives: ['Linux directory hierarchy', 'User permissions and sudo privileges', 'Process inspection (ps, top, systemctl)'],
            resources: [
              { label: 'Linux Command Line Basics', url: 'https://ubuntu.com/tutorials/command-line-for-beginners', type: 'documentation' }
            ],
            practiceType: 'none'
          },
          {
            title: 'Bash Shell Scripting',
            description: 'Write Bash scripts to automate server setups, backup routines, and deployment checks.',
            difficulty: 'Beginner',
            estimatedTime: '4 hours',
            learningObjectives: ['Bash variables, conditionals, loops', 'Handling script arguments and exit codes', 'Automating daily maintenance tasks'],
            resources: [
              { label: 'DevDocs Bash Guide', url: 'https://devdocs.io/bash/', type: 'documentation' }
            ],
            practiceType: 'coding',
            practiceLink: 'coding-questions.html?topic=Bash'
          }
        ]
      },
      {
        title: 'Networking & Security',
        description: 'Understand core networking protocols, SSH keys, SSL/TLS certificates, and firewalls.',
        topics: [
          {
            title: 'Networking Protocols & SSH',
            description: 'Master TCP/IP, DNS routing, HTTP/S headers, SSH keypair authentication, and reverse proxies.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['DNS record types (A, CNAME, MX)', 'SSH key generation and secure server access', 'Nginx reverse proxy configuration'],
            resources: [
              { label: 'DigitalOcean Networking Tutorials', url: 'https://www.digitalocean.com/community/tags/networking', type: 'article' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Version Control & Git Workflows',
        description: 'Implement automated Git workflows, branching strategies, and webhooks.',
        topics: [
          {
            title: 'Git Branching & Webhooks',
            description: 'Structure Git Feature Branch workflows, conventional commits, and trigger CI/CD build webhooks.',
            difficulty: 'Intermediate',
            estimatedTime: '3 hours',
            learningObjectives: ['Gitflow & Trunk-based development', 'GitHub repository webhooks', 'Branch protection rules'],
            resources: [
              { label: 'Atlassian Git Workflows', url: 'https://www.atlassian.com/git/tutorials/comparing-workflows', type: 'article' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Containerization with Docker',
        description: 'Package applications into lightweight, isolated Docker containers.',
        topics: [
          {
            title: 'Dockerfiles & Image Building',
            description: 'Write multi-stage Dockerfiles, build lightweight container images, and publish to Docker Hub.',
            difficulty: 'Intermediate',
            estimatedTime: '5 hours',
            learningObjectives: ['Dockerfile instructions (FROM, RUN, COPY, CMD, ENTRYPOINT)', 'Multi-stage builds for minimal image size', 'Docker image caching optimization'],
            resources: [
              { label: 'Docker Official Documentation', url: 'https://docs.docker.com/get-started/', type: 'documentation' }
            ],
            practiceType: 'none'
          },
          {
            title: 'Docker Compose & Multi-Container Apps',
            description: 'Define and run multi-container applications (Frontend + API + Database) with docker-compose.yml.',
            difficulty: 'Intermediate',
            estimatedTime: '4 hours',
            learningObjectives: ['docker-compose.yml syntax', 'Configuring container networking and volume mounts', 'Environment variables handling'],
            resources: [
              { label: 'Docker Compose Guide', url: 'https://docs.docker.com/compose/', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'CI/CD Pipelines',
        description: 'Automate build, test, and deployment workflows using GitHub Actions and Jenkins.',
        topics: [
          {
            title: 'GitHub Actions & Pipeline Automation',
            description: 'Create YAML workflows for automated testing, linting, Docker image building, and cloud deployment.',
            difficulty: 'Intermediate',
            estimatedTime: '6 hours',
            learningObjectives: ['GitHub Actions triggers & jobs', 'Managing GitHub Secrets and environment variables', 'Automated deployment to cloud servers'],
            resources: [
              { label: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Container Orchestration with Kubernetes',
        description: 'Deploy, scale, and manage containerized applications automatically using Kubernetes (K8s).',
        topics: [
          {
            title: 'Kubernetes Architecture & Core Objects',
            description: 'Master Pods, Deployments, Services, ConfigMaps, Secrets, and Ingress controllers.',
            difficulty: 'Advanced',
            estimatedTime: '8 hours',
            learningObjectives: ['K8s Cluster control plane & worker node components', 'Deployments and Rolling Updates', 'Exposing Pods via NodePort & LoadBalancer Services'],
            resources: [
              { label: 'Kubernetes Official Basics', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Infrastructure as Code (IaC)',
        description: 'Provision cloud infrastructure programmatically using Terraform.',
        topics: [
          {
            title: 'Terraform Fundamentals & AWS Provisioning',
            description: 'Write HCL (HashiCorp Configuration Language) scripts to provision EC2 instances, S3 buckets, and VPCs.',
            difficulty: 'Advanced',
            estimatedTime: '6 hours',
            learningObjectives: ['Terraform providers, resources, and variables', 'Managing Terraform state files securely', 'Terraform plan & apply lifecycle'],
            resources: [
              { label: 'Terraform AWS Getting Started', url: 'https://developer.hashicorp.com/terraform/tutorials/aws-get-started', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Cloud Platforms (AWS)',
        description: 'Architect secure cloud environments on Amazon Web Services (AWS).',
        topics: [
          {
            title: 'Core AWS Services (EC2, S3, IAM, VPC)',
            description: 'Configure virtual servers (EC2), object storage (S3), identity management (IAM), and virtual networks (VPC).',
            difficulty: 'Advanced',
            estimatedTime: '6 hours',
            learningObjectives: ['AWS IAM policies and role delegation', 'VPC subnets, internet gateways, and security groups', 'EC2 auto-scaling groups'],
            resources: [
              { label: 'AWS Documentation', url: 'https://aws.amazon.com/documentation/', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Monitoring, Logging & Observability',
        description: 'Monitor system health and centralize logs using Prometheus, Grafana, and ELK Stack.',
        topics: [
          {
            title: 'Prometheus & Grafana Dashboarding',
            description: 'Collect cluster metrics, set up alerts, and create real-time monitoring dashboards.',
            difficulty: 'Intermediate',
            estimatedTime: '5 hours',
            learningObjectives: ['Scraping metrics with Prometheus', 'Building Grafana visual dashboards', 'Setting up CPU/Memory alert rules'],
            resources: [
              { label: 'Prometheus Documentation', url: 'https://prometheus.io/docs/introduction/overview/', type: 'documentation' }
            ],
            practiceType: 'none'
          }
        ]
      },
      {
        title: 'Projects',
        description: 'Build an end-to-end DevOps automated deployment infrastructure.',
        topics: [
          {
            title: 'Production Kubernetes CI/CD Pipeline',
            description: 'Architect a complete automated Git-to-Kubernetes pipeline using GitHub Actions, Docker, Terraform, and EKS.',
            difficulty: 'Advanced',
            estimatedTime: '15 hours',
            learningObjectives: ['Full infrastructure provisioning via Terraform', 'Automated Docker build & K8s rolling update', 'Monitoring and logging integration'],
            resources: [
              { label: 'CareerPrepHub Project Explorer', url: '/pages/project-explorer.html', type: 'article' }
            ],
            practiceType: 'project',
            practiceLink: 'project-explorer.html'
          }
        ]
      },
      {
        title: 'Interview Preparation',
        description: 'Prepare for DevOps technical interviews and practical scenario tests.',
        topics: [
          {
            title: 'DevOps Scenario & Architecture Questions',
            description: 'Master live troubleshooting scenarios, high-availability architecture design, and zero-downtime deployments.',
            difficulty: 'Advanced',
            estimatedTime: '10 hours',
            learningObjectives: ['Blue/Green vs Canary deployment strategies', 'Debugging container crash loops and network failures', 'Cloud cost optimization strategies'],
            resources: [
              { label: 'DevOps Interview Questions', url: 'https://roadmap.sh/devops', type: 'article' }
            ],
            practiceType: 'interview',
            practiceLink: 'tech-skills.html'
          }
        ]
      }
    ]
  }
];

async function seedRoadmaps() {
  try {
    logger.info('Connecting to Database for Roadmap Seeding...');
    await connectDB();

    logger.info('Clearing existing Roadmaps, Stages, and Topics...');
    await Roadmap.deleteMany({});
    await RoadmapStage.deleteMany({});
    await RoadmapTopic.deleteMany({});

    let totalStagesCreated = 0;
    let totalTopicsCreated = 0;

    for (const rData of roadmapsData) {
      const { stages, ...roadmapInfo } = rData;
      const createdRoadmap = await Roadmap.create(roadmapInfo);
      logger.info(`Created Roadmap: ${createdRoadmap.title} (${createdRoadmap.slug})`);

      for (let sIndex = 0; sIndex < stages.length; sIndex++) {
        const { topics, ...stageInfo } = stages[sIndex];
        const createdStage = await RoadmapStage.create({
          ...stageInfo,
          roadmapId: createdRoadmap._id,
          order: sIndex + 1,
        });
        totalStagesCreated++;

        for (let tIndex = 0; tIndex < topics.length; tIndex++) {
          const topicInfo = topics[tIndex];
          await RoadmapTopic.create({
            ...topicInfo,
            stageId: createdStage._id,
            roadmapId: createdRoadmap._id,
            order: tIndex + 1,
          });
          totalTopicsCreated++;
        }
      }
    }

    logger.info(`Successfully seeded ${roadmapsData.length} Roadmaps, ${totalStagesCreated} Stages, and ${totalTopicsCreated} Topics.`);
    process.exit(0);
  } catch (error) {
    logger.error(`Failed to seed roadmaps: ${error.message}`);
    process.exit(1);
  }
}

seedRoadmaps();
