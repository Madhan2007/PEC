# NEXGENX RAG System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade Retrieval-Augmented Generation (RAG) system for the NEXGENX project that serves as a knowledge layer for a personal-assistant-style AI system, supporting multiple knowledge sources (documents, memory, conversation, web, tools, model knowledge) with intelligent query routing, hybrid retrieval, and multi-source knowledge fusion.

**Architecture:** 22-layer modular pipeline from Foundation (Layer 0) through Production (Layer 21). Each layer has a single responsibility with well-defined interfaces. Core components: Ingestion Pipeline → Document Intelligence → Chunking & Indexing → Embedding → Knowledge Storage → Query Understanding → Query Router → Retrieval → Reranking → Context Engine → Memory → Knowledge Fusion → Reasoning/Agent → Generation → Grounding → Response → Feedback → Evaluation → Observability → Security → Production.

**Tech Stack:** Python 3.11+, FastAPI, Qdrant (vector DB), SQLite/PostgreSQL (metadata), SentenceTransformers/OpenAI embeddings, LangChain/LlamaIndex (optional utilities), Pydantic, pytest, Docker, GitHub Actions.

---

## File Structure Map

```
C:\Users\DELL\Desktop\RAG\
├── src/
│   ├── nexgenx/
│   │   ├── __init__.py
│   │   ├── config/
│   │   │   ├── __init__.py
│   │   │   ├── settings.py              # Layer 0: Configuration management
│   │   │   ├── schemas.py               # Layer 0: Pydantic schemas for all layers
│   │   │   └── constants.py             # Layer 0: Enums, constants, source types
│   │   ├── foundation/
│   │   │   ├── __init__.py
│   │   │   ├── interfaces.py            # Layer 0: Abstract base classes
│   │   │   ├── exceptions.py            # Layer 0: Custom exceptions
│   │   │   └── logging.py               # Layer 0: Structured logging
│   │   ├── ingestion/
│   │   │   ├── __init__.py
│   │   │   ├── pipeline.py              # Layer 1: Ingestion pipeline orchestrator
│   │   │   ├── validators.py            # Layer 1: File validation
│   │   │   ├── detectors.py             # Layer 1: File type detection
│   │   │   ├── parsers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── base.py              # Layer 1: Base parser interface
│   │   │   │   ├── pdf_parser.py        # Layer 1: PDF parsing (PyMuPDF/pdfplumber)
│   │   │   │   ├── docx_parser.py       # Layer 1: DOCX parsing (python-docx)
│   │   │   │   ├── pptx_parser.py       # Layer 1: PPTX parsing (python-pptx)
│   │   │   │   └── text_parser.py       # Layer 1: TXT/MD parsing
│   │   │   ├── extractors.py            # Layer 1: Text extraction utilities
│   │   │   ├── structure.py             # Layer 2: Document structure detection
│   │   │   ├── cleaners.py              # Layer 1: Text cleaning
│   │   │   ├── chunkers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── base.py              # Layer 3: Base chunker interface
│   │   │   │   ├── semantic.py          # Layer 3: Semantic chunking
│   │   │   │   ├── fixed.py             # Layer 3: Fixed-size chunking
│   │   │   │   └── hierarchical.py      # Layer 3: Hierarchical chunking
│   │   │   ├── metadata.py              # Layer 1/3: Metadata extraction
│   │   │   └── quality.py               # Layer 1: Quality checks
│   │   ├── embedding/
│   │   │   ├── __init__.py
│   │   │   ├── providers.py             # Layer 4: Embedding provider abstraction
│   │   │   ├── sentence_transformer.py  # Layer 4: Local embeddings
│   │   │   ├── openai.py                # Layer 4: OpenAI embeddings
│   │   │   └── cache.py                 # Layer 4: Embedding cache
│   │   ├── storage/
│   │   │   ├── __init__.py
│   │   │   ├── vector_store.py          # Layer 5: Qdrant vector store
│   │   │   ├── keyword_store.py         # Layer 5: BM25/keyword index (Whoosh/BM25s)
│   │   │   ├── metadata_store.py        # Layer 5: SQLite/PostgreSQL metadata
│   │   │   ├── hybrid_store.py          # Layer 5: Unified storage interface
│   │   │   └── migrations.py            # Layer 5: Schema migrations
│   │   ├── query/
│   │   │   ├── __init__.py
│   │   │   ├── understanding.py         # Layer 6: Query understanding/analysis
│   │   │   ├── router.py                # Layer 7: Query routing
│   │   │   ├── classifier.py            # Layer 7: Query classification
│   │   │   └── rewriter.py              # Layer 6: Query rewriting/expansion
│   │   ├── retrieval/
│   │   │   ├── __init__.py
│   │   │   ├── dense.py                 # Layer 8: Dense vector retrieval
│   │   │   ├── keyword.py               # Layer 8: Keyword/BM25 retrieval
│   │   │   ├── metadata_filter.py       # Layer 8: Metadata filtering
│   │   │   ├── entity.py                # Layer 8: Entity/graph retrieval
│   │   │   ├── fusion.py                # Layer 8: Result fusion (RRF, weighted)
│   │   │   └── retriever.py             # Layer 8: Unified retriever
│   │   ├── reranking/
│   │   │   ├── __init__.py
│   │   │   ├── cross_encoder.py         # Layer 9: Cross-encoder reranking
│   │   │   ├── llm_reranker.py          # Layer 9: LLM-based reranking
│   │   │   └── hybrid_reranker.py       # Layer 9: Hybrid reranking
│   │   ├── context/
│   │   │   ├── __init__.py
│   │   │   ├── builder.py               # Layer 10: Context building
│   │   │   ├── compressor.py            # Layer 10: Context compression
│   │   │   └── formatter.py             # Layer 10: Context formatting
│   │   ├── memory/
│   │   │   ├── __init__.py
│   │   │   ├── user_memory.py           # Layer 11: User long-term memory
│   │   │   ├── conversation_memory.py   # Layer 11: Conversation memory
│   │   │   ├── project_memory.py        # Layer 11: Project memory
│   │   │   └── memory_store.py          # Layer 11: Memory persistence
│   │   ├── fusion/
│   │   │   ├── __init__.py
│   │   │   ├── knowledge_fusion.py      # Layer 12: Multi-source fusion
│   │   │   ├── conflict_resolver.py     # Layer 12: Conflict resolution
│   │   │   └── synthesizer.py           # Layer 12: Answer synthesis
│   │   ├── reasoning/
│   │   │   ├── __init__.py
│   │   │   ├── agent.py                 # Layer 13: Reasoning agent
│   │   │   ├── tools.py                 # Layer 13: Tool definitions
│   │   │   ├── planner.py               # Layer 13: Multi-step planning
│   │   │   └── executor.py              # Layer 13: Plan execution
│   │   ├── generation/
│   │   │   ├── __init__.py
│   │   │   ├── llm_client.py            # Layer 14: LLM client abstraction
│   │   │   ├── prompts.py               # Layer 14: Prompt templates
│   │   │   └── generator.py             # Layer 14: Response generation
│   │   ├── grounding/
│   │   │   ├── __init__.py
│   │   │   ├── verifier.py              # Layer 15: Claim verification
│   │   │   ├── citation.py              # Layer 15: Citation generation
│   │   │   └── hallucination_check.py   # Layer 15: Hallucination detection
│   │   ├── response/
│   │   │   ├── __init__.py
│   │   │   ├── formatter.py             # Layer 16: Response formatting
│   │   │   ├── citations.py             # Layer 16: Citation formatting
│   │   │   └── actions.py               # Layer 16: Action suggestions
│   │   ├── feedback/
│   │   │   ├── __init__.py
│   │   │   ├── collector.py             # Layer 17: Feedback collection
│   │   │   ├── processor.py             # Layer 17: Feedback processing
│   │   │   └── learning.py              # Layer 17: Learning from feedback
│   │   ├── evaluation/
│   │   │   ├── __init__.py
│   │   │   ├── metrics.py               # Layer 18: Evaluation metrics
│   │   │   ├── datasets.py              # Layer 18: Test datasets
│   │   │   └── runner.py                # Layer 18: Evaluation runner
│   │   ├── observability/
│   │   │   ├── __init__.py
│   │   │   ├── tracing.py               # Layer 19: Distributed tracing
│   │   │   ├── metrics.py               # Layer 19: Metrics collection
│   │   │   └── logger.py                # Layer 19: Structured logging
│   │   ├── security/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                  # Layer 20: Authentication
│   │   │   ├── authorization.py         # Layer 20: Authorization
│   │   │   ├── encryption.py            # Layer 20: Encryption
│   │   │   └── audit.py                 # Layer 20: Audit logging
│   │   ├── production/
│   │   │   ├── __init__.py
│   │   │   ├── api/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py            # Layer 21: API routes
│   │   │   │   ├── middleware.py        # Layer 21: API middleware
│   │   │   │   └── dependencies.py      # Layer 21: FastAPI dependencies
│   │   │   ├── deployment/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── dockerfile.py        # Layer 21: Dockerfile generation
│   │   │   │   ├── docker_compose.py    # Layer 21: Docker Compose
│   │   │   │   └── k8s.py               # Layer 21: Kubernetes manifests
│   │   │   ├── ci_cd.py                 # Layer 21: CI/CD pipeline
│   │   │   └── health.py                # Layer 21: Health checks
│   │   └── main.py                      # Main entry point
│   └── tests/
│       ├── __init__.py
│       ├── unit/
│       ├── integration/
│       └── fixtures/
├── config/
│   ├── default.yaml
│   ├── development.yaml
│   └── production.yaml
├── scripts/
├── docker/
├── .github/workflows/
├── pyproject.toml
├── requirements.txt
├── README.md
└── .env.example
```

---

## Task Breakdown

### Phase 1: Foundation (Layer 0)

#### Task 1: Project Configuration & Settings

**Files:**
- Create: `src/nexgenx/config/settings.py`
- Create: `src/nexgenx/config/schemas.py`
- Create: `src/nexgenx/config/constants.py`
- Create: `config/default.yaml`
- Create: `config/development.yaml`
- Create: `config/production.yaml`
- Create: `.env.example`
- Create: `pyproject.toml`
- Create: `requirements.txt`

- [ ] **Step 1: Write configuration schemas (Pydantic models)**
- [ ] **Step 2: Write settings management with YAML/env loading**
- [ ] **Step 3: Write constants and enums (source types, priorities, etc.)**
- [ ] **Step 4: Write config files for each environment**
- [ ] **Step 5: Write pyproject.toml with dependencies**
- [ ] **Step 6: Write requirements.txt**
- [ ] **Step 7: Write .env.example**
- [ ] **Step 8: Test configuration loading**

#### Task 2: Foundation Interfaces & Logging

**Files:**
- Create: `src/nexgenx/foundation/interfaces.py`
- Create: `src/nexgenx/foundation/exceptions.py`
- Create: `src/nexgenx/foundation/logging.py`
- Create: `src/nexgenx/__init__.py`

- [ ] **Step 1: Write abstract base classes for all layer interfaces**
- [ ] **Step 2: Write custom exception hierarchy**
- [ ] **Step 3: Write structured logging setup**
- [ ] **Step 4: Write package init**
- [ ] **Step 5: Test foundation components**

### Phase 2: Ingestion Pipeline (Layers 1-2)

#### Task 3: File Validation & Type Detection

**Files:**
- Create: `src/nexgenx/ingestion/validators.py`
- Create: `src/nexgenx/ingestion/detectors.py`
- Test: `tests/unit/ingestion/test_validators.py`
- Test: `tests/unit/ingestion/test_detectors.py`

- [ ] **Step 1: Write file validator (size, type, corruption checks)**
- [ ] **Step 2: Write file type detector (magic bytes, extension)**
- [ ] **Step 3: Write unit tests for validators**
- [ ] **Step 4: Write unit tests for detectors**
- [ ] **Step 5: Run tests**

#### Task 4: Document Parsers (PDF, DOCX, PPTX, Text)

**Files:**
- Create: `src/nexgenx/ingestion/parsers/base.py`
- Create: `src/nexgenx/ingestion/parsers/pdf_parser.py`
- Create: `src/nexgenx/ingestion/parsers/docx_parser.py`
- Create: `src/nexgenx/ingestion/parsers/pptx_parser.py`
- Create: `src/nexgenx/ingestion/parsers/text_parser.py`
- Test: `tests/unit/ingestion/test_parsers.py`

- [ ] **Step 1: Write base parser interface**
- [ ] **Step 2: Write PDF parser with PyMuPDF**
- [ ] **Step 3: Write DOCX parser with python-docx**
- [ ] **Step 4: Write PPTX parser with python-pptx**
- [ ] **Step 5: Write text/markdown parser**
- [ ] **Step 6: Write parser tests with fixtures**
- [ ] **Step 7: Run tests**

#### Task 5: Document Structure Detection (Layer 2)

**Files:**
- Create: `src/nexgenx/ingestion/structure.py`
- Test: `tests/unit/ingestion/test_structure.py`

- [ ] **Step 1: Write structure detector (headings, tables, lists, sections)**
- [ ] **Step 2: Write table extraction logic**
- [ ] **Step 3: Write unit tests**
- [ ] **Step 4: Run tests**

#### Task 6: Text Cleaning & Quality Checks

**Files:**
- Create: `src/nexgenx/ingestion/cleaners.py`
- Create: `src/nexgenx/ingestion/quality.py`
- Test: `tests/unit/ingestion/test_cleaners.py`
- Test: `tests/unit/ingestion/test_quality.py`

- [ ] **Step 1: Write text cleaners (whitespace, encoding, artifacts)**
- [ ] **Step 2: Write quality checks (empty, duplicate, language)**
- [ ] **Step 3: Write unit tests**
- [ ] **Step 4: Run tests**

#### Task 7: Ingestion Pipeline Orchestrator

**Files:**
- Create: `src/nexgenx/ingestion/pipeline.py`
- Test: `tests/unit/ingestion/test_pipeline.py`

- [ ] **Step 1: Write pipeline orchestrator connecting all stages**
- [ ] **Step 2: Write unit tests with mock components**
- [ ] **Step 4: Run tests**

### Phase 3: Chunking & Indexing (Layer 3)

#### Task 8: Chunking Strategies

**Files:**
- Create: `src/nexgenx/ingestion/chunkers/base.py`
- Create: `src/nexgenx/ingestion/chunkers/fixed.py`
- Create: `src/nexgenx/ingestion/chunkers/semantic.py`
- Create: `src/nexgenx/ingestion/chunkers/hierarchical.py`
- Test: `tests/unit/ingestion/test_chunkers.py`

- [ ] **Step 1: Write base chunker interface**
- [ ] **Step 2: Write fixed-size chunker with overlap**
- [ ] **Step 3: Write semantic chunker (sentence/paragraph boundaries)**
- [ ] **Step 4: Write hierarchical chunker (document → sections → chunks)**
- [ ] **Step 5: Write chunker tests**
- [ ] **Step 6: Run tests**

#### Task 9: Metadata Extraction

**Files:**
- Create: `src/nexgenx/ingestion/metadata.py`
- Test: `tests/unit/ingestion/test_metadata.py`

- [ ] **Step 1: Write metadata extractor per spec (document_id, source_id, source_type, etc.)**
- [ ] **Step 2: Write content hashing for deduplication**
- [ ] **Step 3: Write unit tests**
- [ ] **Step 4: Run tests**

### Phase 4: Embedding (Layer 4)

#### Task 10: Embedding Providers

**Files:**
- Create: `src/nexgenx/embedding/providers.py`
- Create: `src/nexgenx/embedding/sentence_transformer.py`
- Create: `src/nexgenx/embedding/openai.py`
- Create: `src/nexgenx/embedding/cache.py`
- Test: `tests/unit/embedding/test_providers.py`

- [ ] **Step 1: Write embedding provider abstract interface**
- [ ] **Step 2: Write SentenceTransformers provider (local)**
- [ ] **Step 3: Write OpenAI provider (API)**
- [ ] **Step 4: Write embedding cache (Redis/disk)**
- [ ] **Step 5: Write unit tests**
- [ ] **Step 6: Run tests**

### Phase 5: Knowledge Storage (Layer 5)

#### Task 11: Vector Store (Qdrant)

**Files:**
- Create: `src/nexgenx/storage/vector_store.py`
- Create: `src/nexgenx/storage/migrations.py`
- Test: `tests/unit/storage/test_vector_store.py`

- [ ] **Step 1: Write Qdrant client wrapper with collections**
- [ ] **Step 2: Write vector upsert, search, delete operations**
- [ ] **Step 3: Write collection management (create, recreate)**
- [ ] **Step 4: Write migration system for schema changes**
- [ ] **Step 5: Write unit tests (with testcontainer/mock)**
- [ ] **Step 6: Run tests**

#### Task 12: Keyword Store (BM25)

**Files:**
- Create: `src/nexgenx/storage/keyword_store.py`
- Test: `tests/unit/storage/test_keyword_store.py`

- [ ] **Step 1: Write BM25 index using rank-bm25 or Whoosh**
- [ ] **Step 2: Write keyword search with filtering**
- [ ] **Step 3: Write unit tests**
- [ ] **Step 4: Run tests**

#### Task 13: Metadata Store (SQLite/PostgreSQL)

**Files:**
- Create: `src/nexgenx/storage/metadata_store.py`
- Test: `tests/unit/storage/test_metadata_store.py`

- [ ] **Step 1: Write SQLAlchemy models for metadata**
- [ ] **Step 2: Write metadata CRUD operations**
- [ ] **Step 3: Write unit tests**
- [ ] **Step 4: Run tests**

#### Task 14: Hybrid Store Interface

**Files:**
- Create: `src/nexgenx/storage/hybrid_store.py`
- Test: `tests/unit/storage/test_hybrid_store.py`

- [ ] **Step 1: Write unified storage interface combining vector + keyword + metadata**
- [ ] **Step 2: Write coordinated upsert/search/delete**
- [ ] **Step 3: Write unit tests**
- [ ] **Step 4: Run tests**

### Phase 6: Query Understanding & Routing (Layers 6-7)

#### Task 15: Query Understanding & Classification

**Files:**
- Create: `src/nexgenx/query/understanding.py`
- Create: `src/nexgenx/query/classifier.py`
- Create: `src/nexgenx/query/rewriter.py`
- Test: `tests/unit/query/test_understanding.py`
- Test: `tests/unit/query/test_classifier.py`
- Test: `tests/unit/query/test_rewriter.py`

- [ ] **Step 1: Write query analyzer (intent, entities, complexity)**
- [ ] **Step 2: Write query classifier (project, memory, web, general, etc.)**
- [ ] **Step 3: Write query rewriter (expansion, decomposition, HyDE)**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Run tests**

#### Task 16: Query Router

**Files:**
- Create: `src/nexgenx/query/router.py`
- Test: `tests/unit/query/test_router.py`

- [ ] **Step 1: Write query router with source priority logic**
- [ ] **Step 2: Write parallel route execution**
- [ ] **Step 3: Write unit tests**
- [ ] **Step 4: Run tests**

### Phase 7: Retrieval & Reranking (Layers 8-9)

#### Task 17: Retrieval Mechanisms

**Files:**
- Create: `src/nexgenx/retrieval/dense.py`
- Create: `src/nexgenx/retrieval/keyword.py`
- Create: `src/nexgenx/retrieval/metadata_filter.py`
- Create: `src/nexgenx/retrieval/entity.py`
- Create: `src/nexgenx/retrieval/fusion.py`
- Create: `src/nexgenx/retrieval/retriever.py`
- Test: `tests/unit/retrieval/test_retrieval.py`

- [ ] **Step 1: Write dense vector retriever**
- [ ] **Step 2: Write keyword/BM25 retriever**
- [ ] **Step 3: Write metadata filter retriever**
- [ ] **Step 4: Write entity/graph retriever (optional)**
- [ ] **Step 5: Write result fusion (RRF, weighted scoring)**
- [ ] **Step 6: Write unified retriever orchestrating all**
- [ ] **Step 7: Write unit tests**
- [ ] **Step 8: Run tests**

#### Task 18: Reranking

**Files:**
- Create: `src/nexgenx/reranking/cross_encoder.py`
- Create: `src/nexgenx/reranking/llm_reranker.py`
- Create: `src/nexgenx/reranking/hybrid_reranker.py`
- Test: `tests/unit/reranking/test_reranking.py`

- [ ] **Step 1: Write cross-encoder reranker (sentence-transformers)**
- [ ] **Step 2: Write LLM-based reranker**
- [ ] **Step 3: Write hybrid reranker combining scores**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Run tests**

### Phase 8: Context Engine & Memory (Layers 10-11)

#### Task 19: Context Engine

**Files:**
- Create: `src/nexgenx/context/builder.py`
- Create: `src/nexgenx/context/compressor.py`
- Create: `src/nexgenx/context/formatter.py`
- Test: `tests/unit/context/test_context.py`

- [ ] **Step 1: Write context builder (assemble retrieved chunks)**
- [ ] **Step 2: Write context compressor (summarize, truncate)**
- [ ] **Step 3: Write context formatter (citations, source attribution)**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Run tests**

#### Task 20: Memory Systems

**Files:**
- Create: `src/nexgenx/memory/user_memory.py`
- Create: `src/nexgenx/memory/conversation_memory.py`
- Create: `src/nexgenx/memory/project_memory.py`
- Create: `src/nexgenx/memory/memory_store.py`
- Test: `tests/unit/memory/test_memory.py`

- [ ] **Step 1: Write user memory (preferences, facts, goals)**
- [ ] **Step 2: Write conversation memory (short-term, summaries)**
- [ ] **Step 3: Write project memory (project-specific knowledge)**
- [ ] **Step 4: Write memory persistence layer**
- [ ] **Step 5: Write unit tests**
- [ ] **Step 6: Run tests**

### Phase 9: Knowledge Fusion & Reasoning (Layers 12-13)

#### Task 21: Knowledge Fusion

**Files:**
- Create: `src/nexgenx/fusion/knowledge_fusion.py`
- Create: `src/nexgenx/fusion/conflict_resolver.py`
- Create: `src/nexgenx/fusion/synthesizer.py`
- Test: `tests/unit/fusion/test_fusion.py`

- [ ] **Step 1: Write multi-source knowledge fusion**
- [ ] **Step 2: Write conflict resolver (source priority, recency)**
- [ ] **Step 3: Write answer synthesizer**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Run tests**

#### Task 22: Reasoning Agent

**Files:**
- Create: `src/nexgenx/reasoning/agent.py`
- Create: `src/nexgenx/reasoning/tools.py`
- Create: `src/nexgenx/reasoning/planner.py`
- Create: `src/nexgenx/reasoning/executor.py`
- Test: `tests/unit/reasoning/test_agent.py`

- [ ] **Step 1: Write tool definitions (calculator, web search, code exec, DB query)**
- [ ] **Step 2: Write multi-step planner**
- [ ] **Step 3: Write plan executor with tool calling**
- [ ] **Step 4: Write reasoning agent orchestrating all**
- [ ] **Step 5: Write unit tests**
- [ ] **Step 6: Run tests**

### Phase 10: Generation & Grounding (Layers 14-15)

#### Task 23: LLM Generation

**Files:**
- Create: `src/nexgenx/generation/llm_client.py`
- Create: `src/nexgenx/generation/prompts.py`
- Create: `src/nexgenx/generation/generator.py`
- Test: `tests/unit/generation/test_generation.py`

- [ ] **Step 1: Write LLM client abstraction (OpenAI, Anthropic, local)**
- [ ] **Step 2: Write prompt templates for each query type**
- [ ] **Step 3: Write response generator with streaming**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Run tests**

#### Task 24: Grounding & Verification

**Files:**
- Create: `src/nexgenx/grounding/verifier.py`
- Create: `src/nexgenx/grounding/citation.py`
- Create: `src/nexgenx/grounding/hallucination_check.py`
- Test: `tests/unit/grounding/test_grounding.py`

- [ ] **Step 1: Write claim verifier against sources**
- [ ] **Step 2: Write citation generator with span mapping**
- [ ] **Step 3: Write hallucination detector**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Run tests**

### Phase 11: Response & Feedback (Layers 16-17)

#### Task 25: Response Formatting

**Files:**
- Create: `src/nexgenx/response/formatter.py`
- Create: `src/nexgenx/response/citations.py`
- Create: `src/nexgenx/response/actions.py`
- Test: `tests/unit/response/test_response.py`

- [ ] **Step 1: Write response formatter with structured output**
- [ ] **Step 2: Write citation formatter (inline, footnote, bracket)**
- [ ] **Step 3: Write action suggestions (follow-up, related docs)**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Run tests**

#### Task 26: Feedback System

**Files:**
- Create: `src/nexgenx/feedback/collector.py`
- Create: `src/nexgenx/feedback/processor.py`
- Create: `src/nexgenx/feedback/learning.py`
- Test: `tests/unit/feedback/test_feedback.py`

- [ ] **Step 1: Write feedback collector (thumbs up/down, corrections)**
- [ ] **Step 2: Write feedback processor (analyze patterns)**
- [ ] **Step 3: Write learning system (update weights, memory)**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Run tests**

### Phase 12: Evaluation & Observability (Layers 18-19)

#### Task 27: Evaluation Framework

**Files:**
- Create: `src/nexgenx/evaluation/metrics.py`
- Create: `src/nexgenx/evaluation/datasets.py`
- Create: `src/nexgenx/evaluation/runner.py`
- Test: `tests/unit/evaluation/test_evaluation.py`

- [ ] **Step 1: Write evaluation metrics (precision, recall, MRR, faithfulness)**
- [ ] **Step 2: Write test dataset management**
- [ ] **Step 3: Write evaluation runner**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Run tests**

#### Task 28: Observability

**Files:**
- Create: `src/nexgenx/observability/tracing.py`
- Create: `src/nexgenx/observability/metrics.py`
- Create: `src/nexgenx/observability/logger.py`
- Test: `tests/unit/observability/test_observability.py`

- [ ] **Step 1: Write distributed tracing (OpenTelemetry)**
- [ ] **Step 2: Write metrics collection (Prometheus)**
- [ ] **Step 3: Write structured logging**
- [ ] **Step 4: Write unit tests**
- [ ] **Step 5: Run tests**

### Phase 13: Security & Production (Layers 20-21)

#### Task 29: Security

**Files:**
- Create: `src/nexgenx/security/auth.py`
- Create: `src/nexgenx/security/authorization.py`
- Create: `src/nexgenx/security/encryption.py`
- Create: `src/nexgenx/security/audit.py`
- Test: `tests/unit/security/test_security.py`

- [ ] **Step 1: Write authentication (JWT, API keys)**
- [ ] **Step 2: Write authorization (RBAC, document-level)**
- [ ] **Step 3: Write encryption (at rest, in transit)**
- [ ] **Step 4: Write audit logging**
- [ ] **Step 5: Write unit tests**
- [ ] **Step 6: Run tests**

#### Task 30: Production API & Deployment

**Files:**
- Create: `src/nexgenx/production/api/routes.py`
- Create: `src/nexgenx/production/api/middleware.py`
- Create: `src/nexgenx/production/api/dependencies.py`
- Create: `src/nexgenx/production/deployment/dockerfile.py`
- Create: `src/nexgenx/production/deployment/docker_compose.py`
- Create: `src/nexgenx/production/deployment/k8s.py`
- Create: `src/nexgenx/production/ci_cd.py`
- Create: `src/nexgenx/production/health.py`
- Create: `src/nexgenx/main.py`
- Create: `docker/Dockerfile`
- Create: `docker/docker-compose.yml`
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/cd.yml`
- Test: `tests/integration/test_api.py`

- [ ] **Step 1: Write FastAPI routes (ingest, query, memory, feedback)**
- [ ] **Step 2: Write middleware (auth, logging, rate limit, CORS)**
- [ ] **Step 3: Write FastAPI dependencies**
- [ ] **Step 4: Write Dockerfile**
- [ ] **Step 5: Write docker-compose.yml**
- [ ] **Step 6: Write Kubernetes manifests**
- [ ] **Step 7: Write CI/CD GitHub Actions**
- [ ] **Step 8: Write health check endpoints**
- [ ] **Step 9: Write main entry point**
- [ ] **Step 10: Write integration tests**
- [ ] **Step 11: Run tests**

---

## Integration Tests

**Files:**
- Create: `tests/integration/test_full_pipeline.py`
- Create: `tests/integration/test_query_flow.py`
- Create: `tests/integration/test_memory_flow.py`

- [ ] **Step 1: Write full ingestion → retrieval → generation integration test**
- [ ] **Step 2: Write query routing integration test**
- [ ] **Step 3: Write memory persistence integration test**
- [ ] **Step 4: Run integration tests**

---

## Final Verification

- [ ] **Step 1: Run all unit tests**
- [ ] **Step 2: Run all integration tests**
- [ ] **Step 3: Run evaluation on test dataset**
- [ ] **Step 4: Verify Docker build**
- [ ] **Step 5: Verify CI/CD pipeline**
- [ ] **Step 6: Documentation review**
- [ ] **Step 7: Final commit**