/**
 * ASCEND TECHNICAL INTERVIEW DOMAIN TAXONOMY & RAG KNOWLEDGE DATASET
 * 
 * Provides structured knowledge nodes, concepts, evaluation criteria,
 * and authoritative reference documentation for any technical track.
 */

export const TECHNICAL_DOMAINS_DATASET = {
  "sde-backend": {
    trackTitle: "SDE Interview – Backend",
    category: "Software Engineering - Backend & Systems",
    topics: [
      {
        id: "sys-design",
        topic: "System Design & Distributed Systems",
        category: "Architecture",
        keyConcepts: ["Rate Limiting", "Token Bucket", "Sliding Window", "Consistent Hashing", "Virtual Nodes", "Load Balancing", "Microservices", "Saga Pattern"],
        sampleQuestions: [
          "How would you design a rate limiter handling 100k requests/sec?",
          "Explain how Consistent Hashing reduces key remapping in distributed caches."
        ],
        ragResources: [
          {
            title: "System Design Primer — Rate Limiting & Sliding Windows",
            url: "https://github.com/donnemartin/system-design-primer",
            type: "Architecture Guide",
            relevanceScore: 0.96
          },
          {
            title: "Designing Data-Intensive Applications — Distributed Transactions",
            url: "https://dataintensive.net/",
            type: "Reference Book",
            relevanceScore: 0.98
          }
        ]
      },
      {
        id: "db-caching",
        topic: "Databases & Redis Caching",
        category: "Storage",
        keyConcepts: ["Cache-Aside", "Write-Through", "LRU/LFU Eviction", "ACID", "MVCC", "Indexing", "B-Tree", "Partitioning"],
        sampleQuestions: [
          "Compare Cache-Aside vs Write-Through caching strategies.",
          "How does MVCC in PostgreSQL prevent phantom reads under repeatable read isolation?"
        ],
        ragResources: [
          {
            title: "Redis Official Docs — Cache Eviction Policies",
            url: "https://redis.io/docs/manual/eviction/",
            type: "Official Docs",
            relevanceScore: 0.95
          },
          {
            title: "Use The Index, Luke — Database Indexing Fundamentals",
            url: "https://use-the-index-luke.com/",
            type: "Interactive Guide",
            relevanceScore: 0.93
          }
        ]
      },
      {
        id: "concurrency",
        topic: "Concurrency & Async I/O",
        category: "Core Systems",
        keyConcepts: ["Event Loop", "Libuv", "Thread Pool", "Non-blocking I/O", "Mutex", "Semaphore", "Deadlock", "Thundering Herd"],
        sampleQuestions: [
          "Contrast single-threaded Node.js Event Loop with multi-threaded Java execution.",
          "How do you solve the Thundering Herd cache key expiration problem?"
        ],
        ragResources: [
          {
            title: "Node.js Event Loop & Libuv Architecture",
            url: "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/",
            type: "Deep Dive",
            relevanceScore: 0.94
          }
        ]
      },
      {
        id: "os-net",
        topic: "OS & Networking Fundamentals",
        category: "Infra",
        keyConcepts: ["TCP 3-Way Handshake", "TCP/IP Stack", "HTTP/2", "HTTP/3 QUIC", "Virtual Memory", "Paging", "Process Context Switch"],
        sampleQuestions: [
          "Why is a 3-way handshake required in TCP instead of a 2-way handshake?",
          "How does HTTP/2 multiplexing eliminate Head-of-Line blocking?"
        ],
        ragResources: [
          {
            title: "High Performance Browser Networking — Ilya Grigorik",
            url: "https://hpbn.co/",
            type: "E-Book",
            relevanceScore: 0.96
          }
        ]
      }
    ]
  },
  "sde-frontend": {
    trackTitle: "SDE Interview – Frontend",
    category: "Software Engineering - Frontend & Web",
    topics: [
      {
        id: "react-core",
        topic: "React Fiber & Reconciliation",
        category: "Framework",
        keyConcepts: ["Fiber Tree", "Virtual DOM", "Diffing Heuristics", "Concurrent Mode", "useTransition", "Batching"],
        sampleQuestions: [
          "How does React Fiber achieve O(N) heuristic diffing complexity?",
          "How does useTransition prioritize non-urgent rendering tasks?"
        ],
        ragResources: [
          {
            title: "React Fiber Architecture — Andrew Clark",
            url: "https://github.com/acdlite/react-fiber-architecture",
            type: "Architecture Spec",
            relevanceScore: 0.97
          }
        ]
      },
      {
        id: "web-perf",
        topic: "Web Performance & Metrics",
        category: "Optimization",
        keyConcepts: ["Core Web Vitals", "LCP", "INP", "CLS", "Code Splitting", "Tree Shaking", "Resource Hints", "Yielding to Main Thread"],
        sampleQuestions: [
          "What is INP (Interaction to Next Paint) and how do you yield long tasks to main thread?",
          "How does route-based code splitting reduce initial JS bundle execution time?"
        ],
        ragResources: [
          {
            title: "Web.dev — Core Web Vitals & INP Optimization",
            url: "https://web.dev/inp/",
            type: "Performance Guide",
            relevanceScore: 0.95
          }
        ]
      },
      {
        id: "dom-browser",
        topic: "DOM & Browser APIs",
        category: "Core Web",
        keyConcepts: ["Event Delegation", "Event Bubbling", "Event Capturing", "IntersectionObserver", "ResizeObserver", "MutationObserver"],
        sampleQuestions: [
          "Explain Event Delegation and why it reduces browser memory footprint.",
          "How does IntersectionObserver eliminate scroll event lag during lazy loading?"
        ],
        ragResources: [
          {
            title: "MDN Web Docs — DOM Event Flow & Bubbling",
            url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events",
            type: "Official Docs",
            relevanceScore: 0.92
          }
        ]
      },
      {
        id: "sec-web",
        topic: "Web Security (XSS, CORS, CSRF)",
        category: "Security",
        keyConcepts: ["Cross-Site Scripting", "CSP Directives", "HttpOnly Cookies", "CORS Preflight OPTIONS", "SameSite Cookie Attribute"],
        sampleQuestions: [
          "What triggers a CORS preflight OPTIONS request?",
          "How does Content Security Policy (CSP) prevent XSS injection attacks?"
        ],
        ragResources: [
          {
            title: "OWASP Cheat Sheet — Modern XSS & CSP Defense",
            url: "https://cheatsheetseries.owasp.org/",
            type: "Security Checklist",
            relevanceScore: 0.96
          }
        ]
      }
    ]
  },
  "devops-cloud": {
    trackTitle: "DevOps, Cloud & Infrastructure",
    category: "Cloud Engineering",
    topics: [
      {
        id: "containerization",
        topic: "Docker & Container Architecture",
        category: "Containers",
        keyConcepts: ["Container Layers", "Image Caching", "Multi-stage Builds", "CGroups", "Namespaces", "Docker Compose"],
        sampleQuestions: [
          "How do Linux namespaces and CGroups provide process isolation in Docker?",
          "Why do multi-stage Dockerfiles reduce final production image size?"
        ],
        ragResources: [
          {
            title: "Docker Documentation — Best Practices for Dockerfiles",
            url: "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/",
            type: "Official Docs",
            relevanceScore: 0.94
          }
        ]
      },
      {
        id: "k8s-orchestration",
        topic: "Kubernetes Cluster Management",
        category: "Orchestration",
        keyConcepts: ["Pods", "Deployments", "Services", "Ingress Controllers", "ConfigMaps", "Secrets", "HPA Scaling"],
        sampleQuestions: [
          "How does Kubernetes Service mesh routing differ from Pod IP addresses?",
          "How does Horizontal Pod Autoscaler (HPA) decide when to scale workloads?"
        ],
        ragResources: [
          {
            title: "Kubernetes Documentation — Cluster Architecture",
            url: "https://kubernetes.io/docs/concepts/architecture/",
            type: "Official Docs",
            relevanceScore: 0.96
          }
        ]
      }
    ]
  },
  "ai-ml": {
    trackTitle: "AI, ML & RAG Systems Engineering",
    category: "Artificial Intelligence",
    topics: [
      {
        id: "rag-vector",
        topic: "RAG & Vector Search Databases",
        category: "AI Architecture",
        keyConcepts: ["Embedding Vectors", "Cosine Similarity", "HNSW Indexing", "Pinecone/Chroma", "Chunking Strategies", "HyDE Retrieval"],
        sampleQuestions: [
          "How does HNSW (Hierarchical Navigable Small World) indexing accelerate vector similarity search?",
          "Compare sliding window chunking vs semantic document chunking for RAG pipelines."
        ],
        ragResources: [
          {
            title: "LangChain Documentation — RAG Architecture Best Practices",
            url: "https://python.langchain.com/docs/use_cases/question_answering/",
            type: "Official Docs",
            relevanceScore: 0.97
          }
        ]
      }
    ]
  }
};

/**
 * Utility to match any input topic or custom track keyword against the dataset
 */
export function searchKnowledgeDataset(topicOrKeyword) {
  const query = topicOrKeyword.toLowerCase();
  const matchedResources = [];

  Object.values(TECHNICAL_DOMAINS_DATASET).forEach((domain) => {
    domain.topics.forEach((t) => {
      if (
        t.topic.toLowerCase().includes(query) ||
        t.keyConcepts.some((kc) => kc.toLowerCase().includes(query)) ||
        query.includes(t.id)
      ) {
        matchedResources.push(...t.ragResources);
      }
    });
  });

  return matchedResources.length > 0
    ? matchedResources
    : [
        {
          title: "System Design Primer & Architecture Reference",
          url: "https://github.com/donnemartin/system-design-primer",
          type: "Curated Reference",
          relevanceScore: 0.90
        }
      ];
}
