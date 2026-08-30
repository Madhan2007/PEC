# 🏥 Pre-Existing Condition (PEC) & Health Insurance Claim Intelligence Platform
> **Project Report: Problem Statement, Solutions, Use Cases & Technical Hurdles**

---

## 📌 1. The Problem It Solves

Health insurance claims processing today suffers from **fragmented data**, **manual document verification**, **high fraud vulnerability**, and **lengthy settlement cycles** (often taking 15–45 days). One of the most contentious pain points in the industry is the non-disclosure, misrepresentation, or inaccurate verification of **Pre-Existing Conditions (PECs)**.

```
      Traditional Workflow                         PEC Platform Workflow
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  • Manual paper bill review  │              │  • Real-time OCR extraction  │
│  • Undetected fake receipts  │  ─────────►  │  • Multi-factor Fraud Radar  │
│  • Weeks of waiting time     │              │  • Instant claim tracking    │
│  • Fragmented medical history│              │  • DigiLocker / ABHA audit   │
└──────────────────────────────┘              └──────────────────────────────┘
```

### Core Problems Addressed:

1. **Unintentional & Fraudulent PEC Non-Disclosure:**
   * *Problem:* Insurers lose billions annually to undisclosed chronic ailments, while honest policyholders face wrongful claim repudiations due to ambiguous past medical history documentation.
   * *Solution:* Automated cross-referencing between policy inception dates, DigiLocker medical records, ABHA logs, and hospital admission diagnoses to verify PEC disclosure objectively and without human bias.

2. **Labor-Intensive, Slow Document Verification:**
   * *Problem:* Claims adjusters and TPAs spend days manually reading messy doctor prescriptions, pharmacy bills, diagnostic reports, and discharge summaries.
   * *Solution:* An **Intelligent Medical OCR Engine** that parses document images and PDFs, extracting bill items, diagnostic codes, patient identifiers, and total costs in milliseconds.

3. **Insurance Fraud, Billing Inflation & Phantom Claims:**
   * *Problem:* Fraud schemes like billing for unperformed lab tests, inflated room rents exceeding policy limits, duplicate bill submissions, and altered invoice dates.
   * *Solution:* An automated **Rule & ML-based Fraud Radar Engine** that scores claims against:
     - Discrepancies between claimed amount vs. OCR-extracted bill totals.
     - Exorbitant billing anomalies against standard procedure benchmarks.
     - Date and timeline inconsistencies (e.g., discharge date before admission date).
     - High-risk hospital tagging and duplicate receipt detection.

4. **Opaque Claim Status & Trust Deficit:**
   * *Problem:* Patients are left in the dark regarding why a claim is under review, pending, or rejected, leading to customer disputes and litigation.
   * *Solution:* Real-time visibility into claim stages, automated transparent decision logs, and cryptographically verified ledger audits for every claim state transition.

---

## 👥 2. What People Can Use It For & Key Capabilities

| User Role | What They Use It For | Key Benefits & Capabilities |
| :--- | :--- | :--- |
| 🧑‍💼 **Policyholders & Patients** | Submit cashless & reimbursement claims from home | • 3-step intuitive Claim Submission Wizard.<br>• Instant document scanning with auto-fill.<br>• Real-time claim status & deduction breakdowns.<br>• Direct DigiLocker document sync. |
| 🏥 **Hospitals & Providers** | Initiate pre-authorizations & submit IPD/OPD bills | • Batch document uploading for discharge summaries.<br>• Live policy eligibility and coverage validation.<br>• Faster settlement turnaround without endless back-and-forth emails. |
| 🛡️ **Insurance Underwriters & TPA** | Adjudicate, audit, and approve/reject claims | • Centralized claim queue with intelligent triage.<br>• Fraud Radar scoring (0–100%) with explainable risk flags.<br>• One-click side-by-side comparison of claimed vs. verified amounts.<br>• Policy limit auto-capping and co-pay calculations. |
| ⚙️ **System Administrators** | System health, audit compliance & ML monitoring | • Global platform metrics and settlement performance.<br>• Immutable audit trails and fraud label synchronization.<br>• REST API explorer and integration controls. |

---

## ⚡ 3. How It Makes Existing Tasks Easier, Safer, and Faster

* ⚡ **10x Faster Turnaround Time (TAT):** Eliminates 2–3 week manual delays with instant OCR extraction and automated policy rule validation.
* 🔒 **Safer & Verifiable Adjudication:** Immutable timestamped audit trails for all decisions prevent unauthorized overrides and internal collusion.
* 🎯 **Objective & Explainable Fraud Scoring:** Replaces subjective human guesses with explainable alerts (e.g., claimed vs. extracted discrepancy, out-of-sequence dates).
* 🌐 **Interoperable & Modern:** Full REST API (`/api/v1/`) allows easy integration into existing Hospital Management Systems (HIS) and core insurance portals.

---

## 🛠️ 4. Challenges We Ran Into & How We Overcame Them

### 💥 Challenge 1: Cross-Platform OCR Dependency & Missing Native Drivers
* **The Hurdle:** When processing unstructured medical bills and discharge summaries, third-party OCR libraries (like Tesseract and PaddleOCR) either required heavy external native binaries (`tesseract.exe`) or caused environment-specific missing module errors (e.g., `winrt.windows.storage` on non-UWP or Python 3.14 environments).
* **How We Solved It:** We engineered a **Resilient Multi-Tier OCR Pipeline**:
  1. *Primary Tier:* Hardware-accelerated native Windows OCR (if available).
  2. *Secondary Tier:* PyTesseract engine (if installed).
  3. *Fallback Intelligence Tier:* A resilient heuristic text and regex entity-parser that extracts clinical diagnoses, dates, and currency amounts using rule-based parsing so the system **never crashes or blocks claim submissions** even if external OCR tools are unavailable.

---

### 💥 Challenge 2: Cross-Origin Resource Sharing (CORS) & Token State Sync Between React & Django
* **The Hurdle:** Decoupling the frontend (Vite/React running on port `5173`) from the backend (Django REST Framework on port `8000`) caused CORS pre-flight blocks and session token drops during multi-step claim submissions with multipart document file uploads.
* **How We Solved It:**
  - Configured `django-cors-headers` with whitelist origin policies and allowed custom headers.
  - Implemented an unified API client with automatic bearer token injection and an in-memory fallback layer to maintain seamless interactive state even during offline development.

---

### 💥 Challenge 3: Inconsistent Medical Bill Formats & Entity Ambiguity
* **The Hurdle:** Medical bills from different hospitals have drastically different naming conventions for identical charges (e.g., "Room Rent" vs. "Bed Charges", "Consultation" vs. "Professional Fees", "Pharmacy" vs. "Medicine Dispensation"). Standard rigid JSON parsing frequently failed.
* **How We Solved It:** Built a **Fuzzy Entity Normalization Layer** using regex dictionaries and flexible token matching to categorize irregular billing line items into standardized insurance tariff heads, enabling accurate policy limit auto-capping.

---

### 💥 Challenge 4: False Positives in Fraud Detection
* **The Hurdle:** Strict anomaly detection rules initially flagged legitimate emergency treatments as suspicious when doctors performed urgent procedures that were not pre-authorized.
* **How We Solved It:** Created a **Weighted Multi-Factor Risk Matrix** that weights flags dynamically. Emergency flags are cross-referenced with emergency admission tags, ensuring high-risk scoring is reserved for genuine discrepancies (e.g., altered bill numbers, duplicate claims, math mismatches).
