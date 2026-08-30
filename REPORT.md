# 🏥 Pre-Existing Condition (PEC) & Health Insurance Claim Adjudication Platform
> **Problem Analysis, Solution Architecture & Impact Report**

---

## 1. Executive Summary

Health insurance claims processing today is hindered by **fragmented data**, **manual document verification**, **high fraud vulnerability**, and **lengthy reimbursement cycles** (often taking 15–45 days). One of the most contentious friction points is the non-disclosure, misrepresentation, or erroneous verification of **Pre-Existing Conditions (PECs)**.

The **PEC Claim Intelligence Platform** is an end-to-end, AI-powered adjudication and fraud prevention ecosystem designed to bridge the trust gap between **Patients**, **Hospitals**, and **Insurance Providers**.

```
      Traditional Workflow                         PEC Platform Workflow
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  • Manual paper bill review  │              │  • Real-time OCR extraction  │
│  • Undetected fake receipts  │  ─────────►  │  • Multi-factor Fraud Radar  │
│  • Weeks of waiting time     │              │  • Instant claim tracking    │
│  • Fragmented medical history│              │  • DigiLocker / ABHA audit   │
└──────────────────────────────┘              └──────────────────────────────┘
```

---

## 2. Core Problems Addressed

### 🔴 Problem 1: Unintentional & Fraudulent PEC Non-Disclosure
* **Industry Pain Point:** Insurers lose billions annually to non-disclosed pre-existing chronic conditions. Conversely, honest policyholders frequently suffer from unfair claim repudiations due to ambiguous past medical history documentation.
* **Our Solution:** Automated cross-referencing between policy inception dates, DigiLocker medical records, ABHA (Ayushman Bharat Digital Mission) logs, and hospital admission diagnoses to verify PEC disclosure objectively without bias.

### 🔴 Problem 2: Labor-Intensive, Slow Document Verification
* **Industry Pain Point:** Claims adjusters and TPAs spend countless hours manually reading doctor prescriptions, itemized pharmacy bills, diagnostic reports, and discharge summaries.
* **Our Solution:** An **Intelligent Medical OCR Engine** that parses document images and PDFs, automatically extracting bill items, diagnostic codes, patient identifiers, and total costs in milliseconds.

### 🔴 Problem 3: Insurance Fraud, Billing Inflation & Phantom Claims
* **Industry Pain Point:** Common fraud schemes include billing for unperformed lab tests, inflated room rents exceeding policy limits, duplicate bill submissions, and altered invoice dates.
* **Our Solution:** An automated **Rule & ML-based Fraud Radar Engine** that scores claims against:
  - Discrepancies between claimed amount vs. OCR-extracted bill totals.
  - Exorbitant billing anomalies against standard procedure benchmarks.
  - Date and timeline inconsistencies (e.g., discharge date before admission date).
  - High-risk hospital tagging and duplicate receipt detection.

### 🔴 Problem 4: Opaque Claim Status & Trust Deficit
* **Industry Pain Point:** Policyholders are left in the dark regarding why a claim is under review, pending, or rejected, leading to customer disputes and litigation.
* **Our Solution:** Real-time visibility into claim stages, automated transparent decision logs, and cryptographically verified ledger audits for every claim state transition.

---

## 3. User Roles & Use Cases

| User Role | What They Use It For | Key Benefits & Capabilities |
| :--- | :--- | :--- |
| 🧑‍💼 **Policyholders & Patients** | Submit cashless & reimbursement claims from home | • 3-step intuitive Claim Submission Wizard.<br>• Instant document scanning with auto-fill.<br>• Real-time claim status & deduction breakdowns.<br>• Direct DigiLocker document sync. |
| 🏥 **Hospitals & Providers** | Initiate pre-authorizations & submit IPD/OPD bills | • Batch document uploading for discharge summaries.<br>• Live policy eligibility and coverage validation.<br>• Faster settlement turnaround without endless back-and-forth emails. |
| 🛡️ **Insurance Underwriters & TPA** | Adjudicate, audit, and approve/reject claims | • Centralized claim queue with intelligent triage.<br>• Fraud Radar scoring (0–100%) with explainable risk flags.<br>• One-click side-by-side comparison of claimed vs. verified amounts.<br>• Policy limit auto-capping and co-pay calculations. |
| ⚙️ **System Administrators** | System health, audit compliance & ML monitoring | • Global platform metrics and settlement performance.<br>• Immutable audit trails and fraud label synchronization.<br>• REST API explorer and integration controls. |

---

## 4. How It Makes Existing Tasks Easier, Safer, and Faster

### ⚡ 1. 10x Faster Turnaround Time (TAT)
Instead of waiting 2–3 weeks for third-party administrators (TPAs) to manually enter bill data, the built-in OCR automatically digitizes bills and populates claim line items instantly upon document upload.

### 🔒 2. Safer & Verifiable Adjudication (Audit Trails)
Every stage transition (e.g., `Submitted` ➔ `In Review` ➔ `Approved` / `Flagged`) is logged with an immutable timestamp, adjudicator ID, and reasoning, preventing unauthorized manual overrides and internal collusion.

### 🎯 3. Objective, Explainable Fraud Flags
Rather than arbitrary human decisions, the Fraud Detection module provides transparent, explainable alerts:
* *“Claimed ₹1,20,000 exceeds OCR extracted document total of ₹98,500 by 21.8%”*
* *“Treatment date falls within the 30-day initial policy exclusion window”*
* *“Hospital is flagged on the high-vigilance network list”*

### 🌐 4. Interoperable Multi-Channel Access
Available as both an interactive web application (React + Vite + Tailwind/Glassmorphic UI) and an enterprise-grade REST API (`/api/v1/claims/`, `/api/v1/fraud/`, `/api/v1/auth/`), enabling seamless integration into existing core insurance systems and hospital HIS/EHR setups.

---

## 5. Architectural & Technological Overview

* **Backend Engine:** Python 3 + Django 6 & Django REST Framework with modular micro-apps (`claims`, `fraud_detection`, `authentication`).
* **Frontend Portal:** High-performance React 19 (Vite, TypeScript, Lucide Icons, Glassmorphic responsive design).
* **Intelligence Layer:** Hybrid OCR pipeline (Native Windows Acceleration, Pillow image preprocessing, RegEx heuristic entity extraction) paired with rule-based & ML risk estimation.
