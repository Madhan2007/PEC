# 🏥 Pre-Existing Condition (PEC) & Health Insurance Claim Adjudication Platform

An AI-powered, end-to-end health insurance claim adjudication and fraud prevention platform that bridges the trust gap between **Patients**, **Hospitals**, and **Insurance Underwriters**.

---

## 📌 Executive Summary & Problem It Solves

Health insurance claims processing today is hindered by **fragmented data**, **manual document verification**, **high fraud vulnerability**, and **lengthy reimbursement cycles** (often taking 15–45 days). One of the most contentious friction points is the non-disclosure, misrepresentation, or erroneous verification of **Pre-Existing Conditions (PECs)**.

This platform automates medical document ingestion, extracts critical data via intelligent OCR, checks for pre-existing condition disclosures against policy timelines, and runs real-time rule and ML-based fraud detection.

```
      Traditional Process                          PEC Platform Solution
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  • Manual paper bill review  │              │  • Real-time OCR extraction  │
│  • Undetected fake receipts  │  ─────────►  │  • Multi-factor Fraud Radar  │
│  • Weeks of waiting time     │              │  • Instant claim tracking    │
│  • Fragmented medical history│              │  • DigiLocker / ABHA audit   │
└──────────────────────────────┘              └──────────────────────────────┘
```

---

## 🎯 Key Problems Solved

### 1. Unintentional & Fraudulent PEC Non-Disclosure
* **The Problem:** Insurers lose billions annually to undisclosed chronic conditions, while genuine policyholders face wrongful claim repudiations due to ambiguous past medical history records.
* **The Solution:** Automated cross-referencing between policy inception dates, DigiLocker medical records, ABHA logs, and hospital admission diagnoses to verify PEC disclosure objectively without bias.

### 2. Labor-Intensive, Slow Document Verification
* **The Problem:** Claims adjusters spend hours manually reading doctor prescriptions, itemized pharmacy bills, diagnostic reports, and discharge summaries.
* **The Solution:** An **Intelligent Medical OCR Engine** that parses document images and PDFs, automatically extracting bill items, diagnostic codes, patient identifiers, and total costs in milliseconds.

### 3. Insurance Fraud, Billing Inflation & Phantom Claims
* **The Problem:** Common fraud schemes include billing for unperformed lab tests, inflated room rents exceeding policy limits, duplicate bill submissions, and altered invoice dates.
* **The Solution:** An automated **Rule & ML-based Fraud Radar Engine** that scores claims against:
  - Discrepancies between claimed amount vs. OCR-extracted bill totals.
  - Exorbitant billing anomalies against standard procedure benchmarks.
  - Date and timeline inconsistencies (e.g., discharge date before admission date).
  - High-risk hospital tagging and duplicate receipt detection.

### 4. Opaque Claim Status & Trust Deficit
* **The Problem:** Patients are left in the dark regarding why a claim is under review, pending, or rejected.
* **The Solution:** Real-time visibility into claim stages, automated transparent decision logs, and cryptographically verified ledger audits for every claim state transition.

---

## 👥 Who Can Use It & What For

| User Role | What They Use It For | Key Benefits & Capabilities |
| :--- | :--- | :--- |
| 🧑‍💼 **Policyholders & Patients** | Submit cashless & reimbursement claims from home | • 3-step intuitive Claim Submission Wizard.<br>• Instant document scanning with auto-fill.<br>• Real-time claim status & deduction breakdowns.<br>• Direct DigiLocker document sync. |
| 🏥 **Hospitals & Providers** | Initiate pre-authorizations & submit IPD/OPD bills | • Batch document uploading for discharge summaries.<br>• Live policy eligibility and coverage validation.<br>• Faster settlement turnaround without back-and-forth emails. |
| 🛡️ **Insurance Underwriters & TPA** | Adjudicate, audit, and approve/reject claims | • Centralized claim queue with intelligent triage.<br>• Fraud Radar scoring (0–100%) with explainable risk flags.<br>• One-click side-by-side comparison of claimed vs. verified amounts.<br>• Policy limit auto-capping and co-pay calculations. |
| ⚙️ **System Administrators** | System health, audit compliance & ML monitoring | • Global platform metrics and settlement performance.<br>• Immutable audit trails and fraud label synchronization.<br>• REST API explorer and integration controls. |

---

## 🚀 How It Makes Existing Tasks Easier, Safer, and Faster

* ⚡ **10x Faster Turnaround Time (TAT):** Eliminates 2–3 week manual delays with real-time OCR extraction and automated policy rule validation.
* 🔒 **Safer & Verifiable Adjudication:** Immutable timestamped audit trails for all decisions prevent unauthorized overrides.
* 🎯 **Objective & Explainable Fraud Scoring:** Replaces subjective human guesses with explainable alerts (e.g., claimed vs. extracted discrepancy, out-of-sequence dates).
* 🌐 **Modern Interoperability:** Clean separation with a high-performance React UI and robust Django REST Framework APIs (`/api/v1/`).

---

## 🛠️ Technology Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
* **Backend:** Python 3, Django 6, Django REST Framework, Django CORS Headers
* **OCR & Document AI:** Custom Multi-Pattern Medical OCR Engine (Windows Native Hardware Acceleration / Tesseract / Heuristic Fallback Engine)
* **Database:** SQLite (default / development) / PostgreSQL ready

---

## 🏁 Quick Start Guide

### 1. Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # macOS/Linux

# Install dependencies
pip install -r requirements.txt   # or django djangorestframework django-cors-headers pillow

# Run migrations & start server
python manage.py migrate
python manage.py runserver 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` and communicate with the Django backend at `http://localhost:8000`.

---

## 📄 License
This project is licensed under the MIT License.