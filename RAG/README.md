# VECTORAI DB — Retrieval Layer for PEC

This folder is a dedicated AI retrieval subsystem for the broader PEC project. It is intentionally separate from the main Django healthcare application and focuses on VectorAI DB, semantic search, and retrieval-augmented generation.

## RAG is separate from this project

The main PEC project is a healthcare claims and fraud intelligence platform. It manages:

- patient records
- claim intake and processing
- document uploads and OCR extraction
- status tracking and validation
- fraud detection and risk scoring

The RAG folder is separate because it is focused on AI knowledge retrieval rather than operational business workflows. It acts as a vector-driven intelligence layer sitting alongside the main project rather than replacing it.

## Why we use VectorAI DB

VectorAI DB stores embeddings for document chunks and supports semantic similarity searches. This allows the system to find relevant content by meaning instead of exact words alone.

Benefits include:

- semantic retrieval over large knowledge sets
- grounding answers in indexed evidence
- improved recall for similar concepts
- better handling of document-centric queries
- hybrid retrieval using metadata and vector similarity

## Core RAG flow

The standard flow in this subsystem is:

1. ingest and clean content
2. split text into meaningful chunks
3. convert chunks into embeddings
4. store embeddings in a vector database
5. retrieve the most relevant chunks for a query
6. rerank the candidates
7. produce a grounded answer using the retrieved context

## Why this matters for PEC

The PEC platform handles business workflows, while the RAG layer adds intelligence on top of knowledge. The vector database helps the system understand which information is relevant before generating a response, making AI answers more grounded and useful for institutional knowledge retrieval.

## n8n relationship

The n8n workflow in the project is a communication automation pipeline, not a vector database system. It is used to validate incoming data, split recipients, and send mass email and WhatsApp messages through external services. This sits in the automation layer of the overall project and complements the main healthcare platform and AI retrieval layer.

## Summary

VECTORAI DB is the AI retrieval foundation for the RAG subsystem. It is intentionally separate from the main PEC project to keep business workflows, risk logic, and AI retrieval modular. The larger ecosystem combines claims processing, AI knowledge access, and automation into one solution.
