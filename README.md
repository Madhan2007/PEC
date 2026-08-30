# VECTORAI DB — PEC Healthcare Intelligence Platform

PEC is a healthcare claims and fraud-intelligence platform built with Django. It captures patient and claim data, validates treatment records, analyzes fraud risk, and exposes the results through role-based dashboards and APIs.

## Project purpose

This codebase is designed to support digital healthcare operations by combining:

- patient and claim lifecycle management
- hospital and doctor workflow tracking
- OCR-based document extraction from bills and discharge records
- claim validation and status transitions
- fraud detection and anomaly risk scoring
- dashboards for doctors, auditors, and administrators

## Core architecture

### 1. Authentication and access
The authentication module manages user registration, role-based profiles, login, logout, and API-level access control. It supports different user types and keeps the application secure and auditable.

### 2. Claims and patient workflow
The claims app is the operational backbone of the platform. It stores patient profiles, claim records, treatment metadata, uploaded medical documents, and status tracking across multiple stages.

### 3. Fraud detection engine
The fraud detection layer analyzes suspicious claims using rule-based checks and statistical patterns. It looks for mismatches, duplicate claims, unusually high costs, excessive claim history, and weak document verification.

### 4. OCR and document intelligence
The project processes uploaded documents and extracts structured details so claims can be cross-checked automatically against source bills, discharge summaries, and prescriptions.

## Why the RAG layer is separate

The RAG folder is not the main PEC product. It is a separate AI retrieval layer built around VECTORAI DB, semantic search, and grounded answer generation.

This separation is deliberate:

- PEC handles business operations and healthcare workflows
- VECTORAI DB handles embeddings, semantic retrieval, and knowledge lookup
- RAG provides grounded reasoning from indexed documents
- n8n handles communication automation

## VECTORAI DB and RAG analysis

VECTORAI DB is the retrieval backbone of the AI subsystem. It stores embedded document chunks and supports semantic similarity search so the system can identify the most relevant context before generation.

A standard vector-based workflow is:

1. collect and ingest documents
2. clean and split text into chunks
3. generate embeddings
4. store them in a vector database
5. search for similar content using a query embedding
6. rerank the best matches
7. generate a grounded answer using the retrieved context

This makes VECTORAI DB essential in a modern RAG architecture because it improves retrieval quality beyond simple keyword matching.

## n8n workflow analysis

The workflow file in N8N_workflows/Multi-Recipient Email Sender.json is an automation pipeline for bulk communication. It receives a webhook request, validates the payload, parses recipients, and sends personalized messages via SMTP and WhatsApp through Twilio.

The workflow includes:

- webhook input
- recipient validation and splitting
- email dispatch through SMTP
- WhatsApp personalization and Twilio API send
- success/failure branching
- JSON response generation

This workflow is separate from the claims engine and belongs to the automation layer that supports operational notifications and outbound messaging.

## Full project overview

This repository represents a layered enterprise stack:

- core platform: PEC healthcare claims software
- intelligence layer: VECTORAI DB and RAG system
- workflow automation: n8n multi-channel messaging
- risk analysis: fraud detection and anomaly scoring

## Final conclusion

PEC is primarily a healthcare insurance and claims platform. The RAG subsystem is a separate but complementary AI intelligence layer built around VECTORAI DB for semantic retrieval and grounded answers. The n8n workflow adds communication automation to the broader business system.

## Repository sections

- Authentication: authentication/
- Claims workflow: claims/
- Fraud detection: fraud_detection/
- RAG / VECTORAI DB: RAG/
- n8n workflow automation: N8N_workflows/
- Project configuration: config/

## Status

The repository is structured as a practical enterprise solution combining Django application logic, AI retrieval, and workflow automation.
