**SOFTWARE REQUIREMENTS SPECIFICATION**

**StackRead**

Commercial Digital Library & Self-Publishing Portal

| **Document Type**       | Software Requirements Specification (SRS)    |
| ----------------------- | -------------------------------------------- |
| **Project Name**        | StackRead                                    |
| ---                     | ---                                          |
| **Version**             | 1.0                                          |
| ---                     | ---                                          |
| **Date**                | April 2026                                   |
| ---                     | ---                                          |
| **Author**              | Md. Nuruzzaman                               |
| ---                     | ---                                          |
| **Status**              | Draft                                        |
| ---                     | ---                                          |
| **Reference Platforms** | Scribd, Kindle Unlimited, KDP, Draft2Digital |
| ---                     | ---                                          |

# Table of Contents

[Table of Contents 2](#_heading=)

[1\. Introduction 4](#_heading=)

[1.1 Purpose 4](#_heading=)

[1.2 Project Scope 4](#_heading=)

[1.3 Definitions, Acronyms & Abbreviations 4](#_heading=)

[1.4 References 5](#_heading=)

[1.5 Document Overview 5](#_heading=)

[2\. Overall System Description 6](#_heading=)

[2.1 Product Perspective 6](#_heading=)

[2.2 Product Functions - High Level 6](#_heading=)

[2.3 User Classes and Characteristics 6](#_heading=)

[2.4 Operating Environment 7](#_heading=)

[2.5 Design & Implementation Constraints 7](#_heading=)

[2.6 Assumptions and Dependencies 7](#_heading=)

[3\. User Roles & Permissions Summary 8](#_heading=)

[4\. Functional Requirements 9](#_heading=)

[4.1 Guest Module 9](#_heading=)

[4.1.1 Homepage & Navigation 9](#_heading=)

[4.1.2 Browse & Search 9](#_heading=)

[4.1.3 Title Detail Page 9](#_heading=)

[4.1.4 Author Profile (Public) 10](#_heading=)

[4.1.5 Pricing & Plans 10](#_heading=)

[4.1.6 Registration & Login 10](#_heading=)

[4.2 Reader Module 11](#_heading=)

[4.2.1 Account & Subscription Management 11](#_heading=)

[4.2.2 Profile & Preferences 11](#_heading=)

[4.2.3 Discovery & Search 12](#_heading=)

[4.2.4 Borrowing & Access 12](#_heading=)

[4.2.5 Reading Experience 13](#_heading=)

[4.2.6 Organisation & Lists 13](#_heading=)

[4.2.7 Reading Goals & Gamification 14](#_heading=)

[4.2.8 Community & Social 14](#_heading=)

[4.2.9 Research Tools 15](#_heading=)

[4.3 Author / Publisher Module 15](#_heading=)

[4.3.1 Account & Organisation 15](#_heading=)

[4.3.2 Content Upload & Management 15](#_heading=)

[4.3.3 Rights & Licensing 16](#_heading=)

[4.3.4 Analytics & Reporting 17](#_heading=)

[4.3.5 Revenue & Royalties 17](#_heading=)

[4.3.6 Promotion & Marketing 18](#_heading=)

[4.3.7 Community & Engagement 18](#_heading=)

[4.4 Admin / Staff Module 18](#_heading=)

[4.4.1 User Management 18](#_heading=)

[4.4.2 Catalogue Management 19](#_heading=)

[4.4.3 Subscription & Financial Admin 19](#_heading=)

[4.4.4 Content Moderation 20](#_heading=)

[4.4.5 Events Management 20](#_heading=)

[4.4.6 Platform Analytics 21](#_heading=)

[4.4.7 System Configuration 21](#_heading=)

[4.4.8 Security & Compliance 21](#_heading=)

[5\. Non-Functional Requirements 23](#_heading=)

[5.1 Performance Requirements 23](#_heading=)

[5.2 Security Requirements 23](#_heading=)

[5.3 Reliability & Availability 24](#_heading=)

[5.4 Scalability Requirements 24](#_heading=)

[5.5 Accessibility Requirements 24](#_heading=)

[5.6 Usability Requirements 25](#_heading=)

[5.7 Internationalisation & Localisation 25](#_heading=)

[5.8 Maintainability 25](#_heading=)

[6\. External Interface Requirements 27](#_heading=)

[6.1 User Interface Requirements 27](#_heading=)

[6.2 Hardware Interfaces 27](#_heading=)

[6.3 Software & API Interfaces 27](#_heading=)

[6.4 Communication Interfaces 28](#_heading=)

[7\. System Constraints 29](#_heading=)

[8\. Assumptions & Dependencies 30](#_heading=)

[8.1 Assumptions 30](#_heading=)

[8.2 Dependencies 30](#_heading=)

[9\. Appendix - Requirement Traceability Matrix 31](#_heading=)

[Priority Legend 32](#_heading=)

[Document Revision History 33](#_heading=)

# 1\. Introduction

## 1.1 Purpose

This Software Requirements Specification (SRS) document describes the complete functional and non-functional requirements for StackRead - a commercial digital library and self-publishing portal. It is intended to serve as the primary reference document for design, development, testing, and deployment of the platform.

This document will be used by the solo developer throughout the development lifecycle to ensure all agreed-upon requirements are implemented correctly and completely.

## 1.2 Project Scope

StackRead is a full-stack web and mobile platform that allows:

- Readers to subscribe and access a large catalogue of eBooks, audiobooks, and documents.
- Authors and publishers to upload, manage, and monetise their content directly.
- Platform administrators to govern, moderate, and operate the system end-to-end.

The platform will be accessible via a responsive web application and native iOS and Android mobile apps. StackRead draws inspiration from Scribd, Kindle Unlimited, Kindle Direct Publishing (KDP), and Draft2Digital.

## 1.3 Definitions, Acronyms & Abbreviations

| **Term** | **Definition**                                                   |
| -------- | ---------------------------------------------------------------- |
| SRS      | Software Requirements Specification - this document              |
| ---      | ---                                                              |
| FR       | Functional Requirement                                           |
| ---      | ---                                                              |
| NFR      | Non-Functional Requirement                                       |
| ---      | ---                                                              |
| MUST     | MoSCoW priority: required for launch (Must Have)                 |
| ---      | ---                                                              |
| SHOULD   | MoSCoW priority: important but not launch-blocking (Should Have) |
| ---      | ---                                                              |
| COULD    | MoSCoW priority: nice to have in future iterations (Could Have)  |
| ---      | ---                                                              |
| UI       | User Interface                                                   |
| ---      | ---                                                              |
| API      | Application Programming Interface                                |
| ---      | ---                                                              |
| DRM      | Digital Rights Management                                        |
| ---      | ---                                                              |
| SSO      | Single Sign-On                                                   |
| ---      | ---                                                              |
| WCAG     | Web Content Accessibility Guidelines                             |
| ---      | ---                                                              |
| GDPR     | General Data Protection Regulation                               |
| ---      | ---                                                              |
| MRR      | Monthly Recurring Revenue                                        |
| ---      | ---                                                              |
| KDP      | Kindle Direct Publishing (reference platform)                    |
| ---      | ---                                                              |
| ToS      | Terms of Service                                                 |
| ---      | ---                                                              |
| JWT      | JSON Web Token (used for authentication)                         |
| ---      | ---                                                              |
| CDN      | Content Delivery Network                                         |
| ---      | ---                                                              |
| OTP      | One-Time Password                                                |
| ---      | ---                                                              |
| EPUB     | Electronic Publication - standard eBook format                   |
| ---      | ---                                                              |
| PWA      | Progressive Web Application                                      |
| ---      | ---                                                              |

## 1.4 References

- Scribd - scribd.com (subscription reading model)
- Kindle Unlimited - amazon.com/kindle-unlimited (subscription + royalty pool)
- Kindle Direct Publishing - kdp.amazon.com (author self-publishing)
- Draft2Digital - draft2digital.com (publisher tools and distribution)
- WCAG 2.1 Accessibility Guidelines - w3.org/TR/WCAG21
- GDPR Regulation - gdpr.eu
- IEEE SRS Standard 830-1998

## 1.5 Document Overview

This SRS is organized into the following major sections:

- Section 1 - Introduction and overview
- Section 2 - Overall system description
- Section 3 - User roles and characteristics
- Section 4 - Functional requirements (by user role)
- Section 5 - Non-functional requirements
- Section 6 - External interface requirements
- Section 7 - System constraints
- Section 8 - Assumptions and dependencies
- Section 9 - Appendix - requirement traceability matrix

# 2\. Overall System Description

## 2.1 Product Perspective

StackRead is a standalone commercial SaaS platform. It is not a component of any existing system. It will be accessible on the web via modern browsers, and through dedicated apps on iOS and Android. The system will integrate with third-party services including payment gateways, DRM providers, cloud storage, email services, and analytics platforms.

## 2.2 Product Functions - High Level

| **Module**                | **Summary**                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| Guest Portal              | Browse catalogue, view samples, see pricing, register, login         |
| ---                       | ---                                                                  |
| Reader Portal             | Subscribe, read, borrow, annotate, community features, reading goals |
| ---                       | ---                                                                  |
| Author / Publisher Portal | Upload content, manage rights, track analytics, receive royalties    |
| ---                       | ---                                                                  |
| Admin / Staff Portal      | User management, catalogue governance, financial admin, security     |
| ---                       | ---                                                                  |
| Reading Engine            | In-browser eBook/PDF reader and audio player                         |
| ---                       | ---                                                                  |
| Royalty Engine            | Calculate and distribute royalties based on reads and purchases      |
| ---                       | ---                                                                  |
| Search & Discovery        | Full-text search, filters, AI recommendations                        |
| ---                       | ---                                                                  |
| Notification System       | Email, push, and in-app notifications                                |
| ---                       | ---                                                                  |
| Payment System            | Subscription billing, individual purchases, payouts                  |
| ---                       | ---                                                                  |

## 2.3 User Classes and Characteristics

| **User Class**           | **Technical Level** | **Primary Goal**                                       |
| ------------------------ | ------------------- | ------------------------------------------------------ |
| Guest                    | Any                 | Discover content, evaluate platform before registering |
| ---                      | ---                 | ---                                                    |
| Reader                   | Non-technical       | Access and enjoy books via subscription                |
| ---                      | ---                 | ---                                                    |
| Author (Individual)      | Low-Medium          | Publish own work and earn royalties                    |
| ---                      | ---                 | ---                                                    |
| Publisher (Organisation) | Medium              | Manage multiple authors and titles, track revenue      |
| ---                      | ---                 | ---                                                    |
| Platform Staff           | Medium              | Moderate content, handle support tickets               |
| ---                      | ---                 | ---                                                    |
| Platform Admin           | High                | Full system governance, financial control, security    |
| ---                      | ---                 | ---                                                    |

## 2.4 Operating Environment

- Web browsers: Chrome 110+, Firefox 110+, Safari 16+, Edge 110+ on Windows, macOS, Linux
- Mobile: iOS 15+ and Android 10+ via native apps
- Server: Linux-based cloud infrastructure (AWS or GCP)
- Database: Mongodb, Redis 7+
- Minimum server specs for production: 4 vCPU, 16 GB RAM, 500 GB SSD storage

## 2.5 Design & Implementation Constraints

- Solo developer - features must be scoped and prioritised using MoSCoW to ensure a deliverable MVP.
- DRM must be integrated from the beginning - cannot be retrofitted easily.
- All financial transactions must use PCI-DSS compliant payment processors (Stripe, PayPal).
- Platform must comply with GDPR and PDPA from day one.
- All user-facing interfaces must meet WCAG 2.1 AA accessibility standards.
- All uploaded content files must be served via CDN - never directly from origin server.

## 2.6 Assumptions and Dependencies

- Stripe and/or PayPal will be used as payment processors and are assumed to be available globally.
- AWS S3 (or equivalent) will be used for file storage.
- A third-party DRM provider (e.g. Readium LCP) will be integrated for content protection.
- Email delivery will depend on a transactional email provider (e.g. SendGrid or Resend).
- Push notifications for mobile apps will use Firebase Cloud Messaging (FCM).
- Author royalty rates and platform commission percentages may be adjusted by admin after launch.

# 3\. User Roles & Permissions Summary

| **Role**  | **Auth Required** | **Can Read Content** | **Can Upload Content** | **Can Manage Users** | **Can Access Finance** |
| --------- | ----------------- | -------------------- | ---------------------- | -------------------- | ---------------------- |
| Guest     | No                | Samples only         | No                     | No                   | No                     |
| ---       | ---               | ---                  | ---                    | ---                  | ---                    |
| Reader    | Yes               | Yes (subscribed)     | No                     | No                   | Own billing only       |
| ---       | ---               | ---                  | ---                    | ---                  | ---                    |
| Author    | Yes               | Yes (subscribed)     | Own titles             | No                   | Own royalties          |
| ---       | ---               | ---                  | ---                    | ---                  | ---                    |
| Publisher | Yes               | Yes (subscribed)     | All org titles         | Org team only        | Org royalties          |
| ---       | ---               | ---                  | ---                    | ---                  | ---                    |
| Staff     | Yes (Admin)       | Yes                  | No                     | Limited              | View only              |
| ---       | ---               | ---                  | ---                    | ---                  | ---                    |
| Admin     | Yes (Admin)       | Yes                  | Yes (override)         | Full                 | Full                   |
| ---       | ---               | ---                  | ---                    | ---                  | ---                    |

# 4\. Functional Requirements

## 4.1 Guest Module

### 4.1.1 Homepage & Navigation

| **REQ ID**   | **Priority** | **Requirement**                                                                                                                   |
| ------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **FR-G-001** | **MUST**     | The system shall display a homepage with featured titles, trending books, new arrivals, and staff picks to unauthenticated users. |
| ---          | ---          | ---                                                                                                                               |
| **FR-G-002** | **MUST**     | The system shall provide a persistent navigation bar with links to search, browse, pricing, login, and register.                  |
| ---          | ---          | ---                                                                                                                               |
| **FR-G-003** | **SHOULD**   | The homepage shall display a promotional banner for active subscription offers or new author spotlights.                          |
| ---          | ---          | ---                                                                                                                               |

### 4.1.2 Browse & Search

| **REQ ID**   | **Priority** | **Requirement**                                                                                                                  |
| ------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **FR-G-010** | **MUST**     | The system shall allow guests to browse the catalogue by genre, format, language, and subject without logging in.                |
| ---          | ---          | ---                                                                                                                              |
| **FR-G-011** | **MUST**     | The system shall allow guests to perform keyword search by title, author name, ISBN, and keywords.                               |
| ---          | ---          | ---                                                                                                                              |
| **FR-G-012** | **MUST**     | The system shall allow guests to filter search results by format (eBook, audiobook, PDF), genre, language, and publication year. |
| ---          | ---          | ---                                                                                                                              |
| **FR-G-013** | **SHOULD**   | The system shall display search results with cover image, title, author, rating, and format icons.                               |
| ---          | ---          | ---                                                                                                                              |
| **FR-G-014** | **SHOULD**   | The system shall show related titles and series information on each title detail page.                                           |
| ---          | ---          | ---                                                                                                                              |

### 4.1.3 Title Detail Page

| **REQ ID**   | **Priority** | **Requirement**                                                                                                                                      |
| ------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-G-020** | **MUST**     | The system shall display a title detail page showing cover image, title, author, synopsis, genre tags, format, loan duration, and available formats. |
| ---          | ---          | ---                                                                                                                                                  |
| **FR-G-021** | **MUST**     | The system shall show the current availability status - Available, On Loan, or Waitlist - with queue count.                                          |
| ---          | ---          | ---                                                                                                                                                  |
| **FR-G-022** | **MUST**     | The system shall display reader reviews and star ratings on the title detail page to guests.                                                         |
| ---          | ---          | ---                                                                                                                                                  |
| **FR-G-023** | **SHOULD**   | The system shall show a free sample/excerpt reader for permitted titles without requiring login.                                                     |
| ---          | ---          | ---                                                                                                                                                  |
| **FR-G-024** | **SHOULD**   | The system shall allow guests to listen to a short audiobook sample (first 5 minutes) without logging in.                                            |
| ---          | ---          | ---                                                                                                                                                  |

### 4.1.4 Author Profile (Public)

| **REQ ID**   | **Priority** | **Requirement**                                                                                                           |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **FR-G-030** | **MUST**     | The system shall display a public author profile page with bio, photo, genre tags, full bibliography, and follower count. |
| ---          | ---          | ---                                                                                                                       |
| **FR-G-031** | **SHOULD**   | The system shall show upcoming events hosted by or featuring the author on their profile page.                            |
| ---          | ---          | ---                                                                                                                       |

### 4.1.5 Pricing & Plans

| **REQ ID**   | **Priority** | **Requirement**                                                                                           |
| ------------ | ------------ | --------------------------------------------------------------------------------------------------------- |
| **FR-G-040** | **MUST**     | The system shall display a pricing page showing all subscription plans with features and pricing clearly. |
| ---          | ---          | ---                                                                                                       |
| **FR-G-041** | **MUST**     | The system shall show a free trial offer (if active) prominently on the pricing page.                     |
| ---          | ---          | ---                                                                                                       |
| **FR-G-042** | **SHOULD**   | The system shall allow guests to compare subscription plans side by side.                                 |
| ---          | ---          | ---                                                                                                       |

### 4.1.6 Registration & Login

| **REQ ID**   | **Priority** | **Requirement**                                                                           |
| ------------ | ------------ | ----------------------------------------------------------------------------------------- |
| **FR-G-050** | **MUST**     | The system shall allow guests to register a new reader account using email and password.  |
| ---          | ---          | ---                                                                                       |
| **FR-G-051** | **MUST**     | The system shall allow guests to register using Google OAuth and Facebook Sign-In.        |
| ---          | ---          | ---                                                                                       |
| **FR-G-052** | **MUST**     | The system shall allow guests to register as an author or publisher via a dedicated form. |
| ---          | ---          | ---                                                                                       |
| **FR-G-053** | **MUST**     | The system shall require email verification before activating a new account.              |
| ---          | ---          | ---                                                                                       |
| **FR-G-054** | **MUST**     | The system shall allow guests to log in using email/password or social login.             |
| ---          | ---          | ---                                                                                       |
| **FR-G-055** | **MUST**     | The system shall provide a password reset flow via email OTP or reset link.               |
| ---          | ---          | ---                                                                                       |
| **FR-G-056** | **SHOULD**   | The system shall offer an institutional SSO login option for partnered organisations.     |
| ---          | ---          | ---                                                                                       |

## 4.2 Reader Module

### 4.2.1 Account & Subscription Management

| **REQ ID**   | **Priority** | **Requirement**                                                                                                       |
| ------------ | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| **FR-R-001** | **MUST**     | The system shall allow readers to choose a subscription plan (Basic, Standard, Premium) during or after registration. |
| ---          | ---          | ---                                                                                                                   |
| **FR-R-002** | **MUST**     | The system shall process subscription payments via Stripe and/or PayPal.                                              |
| ---          | ---          | ---                                                                                                                   |
| **FR-R-003** | **MUST**     | The system shall allow readers to upgrade, downgrade, or cancel their subscription at any time.                       |
| ---          | ---          | ---                                                                                                                   |
| **FR-R-004** | **MUST**     | The system shall send an email confirmation on subscription start, renewal, cancellation, and payment failure.        |
| ---          | ---          | ---                                                                                                                   |
| **FR-R-005** | **MUST**     | The system shall display current subscription status, next renewal date, and billing history on the account page.     |
| ---          | ---          | ---                                                                                                                   |
| **FR-R-006** | **MUST**     | The system shall allow readers to update their payment method.                                                        |
| ---          | ---          | ---                                                                                                                   |
| **FR-R-007** | **MUST**     | The system shall allow readers to download PDF invoices for past payments.                                            |
| ---          | ---          | ---                                                                                                                   |
| **FR-R-008** | **SHOULD**   | The system shall allow readers to apply promo codes during checkout.                                                  |
| ---          | ---          | ---                                                                                                                   |
| **FR-R-009** | **SHOULD**   | The system shall allow readers to view and revoke active login sessions on other devices.                             |
| ---          | ---          | ---                                                                                                                   |
| **FR-R-010** | **COULD**    | The system shall support gifting a subscription to another user.                                                      |
| ---          | ---          | ---                                                                                                                   |

### 4.2.2 Profile & Preferences

| **REQ ID**   | **Priority** | **Requirement**                                                                                                     |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| **FR-R-020** | **MUST**     | The system shall allow readers to set and update their display name, avatar, and bio.                               |
| ---          | ---          | ---                                                                                                                 |
| **FR-R-021** | **MUST**     | The system shall allow readers to select preferred genres, languages, and formats to personalise recommendations.   |
| ---          | ---          | ---                                                                                                                 |
| **FR-R-022** | **MUST**     | The system shall allow readers to control privacy settings - public/private reading history and lists.              |
| ---          | ---          | ---                                                                                                                 |
| **FR-R-023** | **MUST**     | The system shall allow readers to configure notification preferences (email, push, in-app) per notification type.   |
| ---          | ---          | ---                                                                                                                 |
| **FR-R-024** | **SHOULD**   | The system shall allow readers to change their email address with re-verification.                                  |
| ---          | ---          | ---                                                                                                                 |
| **FR-R-025** | **SHOULD**   | The system shall allow readers to enable two-factor authentication (2FA) via authenticator app or email OTP.        |
| ---          | ---          | ---                                                                                                                 |
| **FR-R-026** | **MUST**     | The system shall allow readers to request account deletion, which triggers a GDPR-compliant data deletion workflow. |
| ---          | ---          | ---                                                                                                                 |

### 4.2.3 Discovery & Search

| **REQ ID**   | **Priority** | **Requirement**                                                                                                              |
| ------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **FR-R-030** | **MUST**     | The system shall provide a full-text search across all titles in the catalogue accessible to the reader's subscription tier. |
| ---          | ---          | ---                                                                                                                          |
| **FR-R-031** | **MUST**     | The system shall support filtering by format, genre, language, rating, availability, and publication year simultaneously.    |
| ---          | ---          | ---                                                                                                                          |
| **FR-R-032** | **MUST**     | The system shall display AI-powered personalised recommendations on the reader homepage and discover page.                   |
| ---          | ---          | ---                                                                                                                          |
| **FR-R-033** | **SHOULD**   | The system shall allow readers to save searches and receive alerts when new titles matching the query are added.             |
| ---          | ---          | ---                                                                                                                          |
| **FR-R-034** | **SHOULD**   | The system shall suggest similar titles and series continuation on the title detail page.                                    |
| ---          | ---          | ---                                                                                                                          |
| **FR-R-035** | **COULD**    | The system shall support mood-based discovery - reader selects a mood or theme and receives matching suggestions.            |
| ---          | ---          | ---                                                                                                                          |
| **FR-R-036** | **COULD**    | The system shall support reading-time-estimate filtering - find books readable in under 2 hours, half a day, etc.            |
| ---          | ---          | ---                                                                                                                          |

### 4.2.4 Borrowing & Access

| **REQ ID**   | **Priority** | **Requirement**                                                                                                    |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| **FR-R-040** | **MUST**     | The system shall allow subscribed readers to access titles in the subscription catalogue without borrowing limits. |
| ---          | ---          | ---                                                                                                                |
| **FR-R-041** | **MUST**     | The system shall allow readers to place holds on titles with active simultaneous user limits.                      |
| ---          | ---          | ---                                                                                                                |
| **FR-R-042** | **MUST**     | The system shall notify readers via email and push notification when a held title becomes available.               |
| ---          | ---          | ---                                                                                                                |
| **FR-R-043** | **MUST**     | The system shall display the reader's current queue position for each active hold.                                 |
| ---          | ---          | ---                                                                                                                |
| **FR-R-044** | **MUST**     | The system shall allow readers to view their full borrowing history with re-access shortcuts.                      |
| ---          | ---          | ---                                                                                                                |
| **FR-R-045** | **MUST**     | The system shall allow readers to download titles for offline access within their active subscription period.      |
| ---          | ---          | ---                                                                                                                |
| **FR-R-046** | **SHOULD**   | The system shall allow readers to borrow both the eBook and audiobook version of the same title simultaneously.    |
| ---          | ---          | ---                                                                                                                |
| **FR-R-047** | **SHOULD**   | The system shall allow readers to purchase individual titles outside the subscription catalogue.                   |
| ---          | ---          | ---                                                                                                                |

### 4.2.5 Reading Experience

| **REQ ID**   | **Priority** | **Requirement**                                                                                                                       |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-R-050** | **MUST**     | The system shall provide an in-browser eBook reader supporting EPUB and PDF formats.                                                  |
| ---          | ---          | ---                                                                                                                                   |
| **FR-R-051** | **MUST**     | The system shall allow readers to adjust font size, font family, line spacing, margins, and background theme (light, dark, system).   |
| ---          | ---          | ---                                                                                                                                   |
| **FR-R-052** | **MUST**     | The system shall include at least one dyslexia-friendly font option (e.g. OpenDyslexic).                                              |
| ---          | ---          | ---                                                                                                                                   |
| **FR-R-053** | **MUST**     | The system shall allow readers to highlight text and add personal notes/annotations.                                                  |
| ---          | ---          | ---                                                                                                                                   |
| **FR-R-054** | **MUST**     | The system shall save reading position automatically and sync across all logged-in devices in real time.                              |
| ---          | ---          | ---                                                                                                                                   |
| **FR-R-055** | **MUST**     | The system shall display reading progress as a percentage and chapter indicator.                                                      |
| ---          | ---          | ---                                                                                                                                   |
| **FR-R-056** | **MUST**     | The system shall provide an integrated audiobook player with play/pause, chapter skip, speed control (0.5x to 3x), and a sleep timer. |
| ---          | ---          | ---                                                                                                                                   |
| **FR-R-057** | **SHOULD**   | The system shall provide in-book word lookup using a built-in dictionary and Wikipedia integration.                                   |
| ---          | ---          | ---                                                                                                                                   |
| **FR-R-058** | **SHOULD**   | The system shall provide in-book text translation for selected passages.                                                              |
| ---          | ---          | ---                                                                                                                                   |
| **FR-R-059** | **SHOULD**   | The system shall provide text-to-speech for eBook content (read-aloud mode).                                                          |
| ---          | ---          | ---                                                                                                                                   |
| **FR-R-060** | **COULD**    | The system shall allow readers to export their highlights and annotations as a PDF or text file.                                      |
| ---          | ---          | ---                                                                                                                                   |

### 4.2.6 Organisation & Lists

| **REQ ID**   | **Priority** | **Requirement**                                                                                        |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------ |
| **FR-R-070** | **MUST**     | The system shall allow readers to create multiple named reading lists (e.g. Want to Read, Favourites). |
| ---          | ---          | ---                                                                                                    |
| **FR-R-071** | **MUST**     | The system shall allow readers to add or remove any title from any of their reading lists.             |
| ---          | ---          | ---                                                                                                    |
| **FR-R-072** | **SHOULD**   | The system shall allow readers to make individual lists public or private.                             |
| ---          | ---          | ---                                                                                                    |
| **FR-R-073** | **SHOULD**   | The system shall allow readers to share a reading list via a public link.                              |
| ---          | ---          | ---                                                                                                    |
| **FR-R-074** | **SHOULD**   | The system shall allow readers to export a reading list as a CSV file.                                 |
| ---          | ---          | ---                                                                                                    |
| **FR-R-075** | **COULD**    | The system shall allow readers to add personal tags to titles for custom organisation.                 |
| ---          | ---          | ---                                                                                                    |

### 4.2.7 Reading Goals & Gamification

| **REQ ID**   | **Priority** | **Requirement**                                                                                                     |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| **FR-R-080** | **SHOULD**   | The system shall allow readers to set a yearly or monthly reading goal (number of books or pages).                  |
| ---          | ---          | ---                                                                                                                 |
| **FR-R-081** | **SHOULD**   | The system shall track and display daily reading streaks on the reader dashboard.                                   |
| ---          | ---          | ---                                                                                                                 |
| **FR-R-082** | **SHOULD**   | The system shall award digital badges for reading milestones - first book, 5 books, 25 books, genre explorer, etc.  |
| ---          | ---          | ---                                                                                                                 |
| **FR-R-083** | **SHOULD**   | The system shall generate an annual reading summary showing total books, pages, hours, top genres, and top authors. |
| ---          | ---          | ---                                                                                                                 |
| **FR-R-084** | **COULD**    | The system shall allow readers to share their reading summary as an image card to social media.                     |
| ---          | ---          | ---                                                                                                                 |

### 4.2.8 Community & Social

| **REQ ID**   | **Priority** | **Requirement**                                                                                                          |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **FR-R-090** | **MUST**     | The system shall allow readers to write and submit a text review and star rating (1-5) for any title they have accessed. |
| ---          | ---          | ---                                                                                                                      |
| **FR-R-091** | **MUST**     | The system shall display reviews on title detail pages visible to all users including guests.                            |
| ---          | ---          | ---                                                                                                                      |
| **FR-R-092** | **SHOULD**   | The system shall allow readers to like and comment on other readers' reviews.                                            |
| ---          | ---          | ---                                                                                                                      |
| **FR-R-093** | **SHOULD**   | The system shall allow readers to follow other reader and author profiles.                                               |
| ---          | ---          | ---                                                                                                                      |
| **FR-R-094** | **SHOULD**   | The system shall display a social feed showing activity from followed users - reviews, completed books, list additions.  |
| ---          | ---          | ---                                                                                                                      |
| **FR-R-095** | **SHOULD**   | The system shall allow readers to join or create book clubs with a description, cover, and genre tags.                   |
| ---          | ---          | ---                                                                                                                      |
| **FR-R-096** | **SHOULD**   | The system shall provide a discussion thread within each book club for group conversation.                               |
| ---          | ---          | ---                                                                                                                      |
| **FR-R-097** | **COULD**    | The system shall allow book club members to share and view each other's annotations on a shared title.                   |
| ---          | ---          | ---                                                                                                                      |
| **FR-R-098** | **SHOULD**   | The system shall allow readers to RSVP to author events and platform programmes.                                         |
| ---          | ---          | ---                                                                                                                      |

### 4.2.9 Research Tools

| **REQ ID**   | **Priority** | **Requirement**                                                                                                       |
| ------------ | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| **FR-R-100** | **SHOULD**   | The system shall allow readers to generate a formatted citation for any title in APA, MLA, Chicago, or Harvard style. |
| ---          | ---          | ---                                                                                                                   |
| **FR-R-101** | **SHOULD**   | The system shall allow readers to save citations to a personal reference list.                                        |
| ---          | ---          | ---                                                                                                                   |
| **FR-R-102** | **SHOULD**   | The system shall allow readers to export their reference list as a formatted document or plain text.                  |
| ---          | ---          | ---                                                                                                                   |
| **FR-R-103** | **COULD**    | The system shall allow readers to submit an inter-library loan (ILL) request for titles not in the catalogue.         |
| ---          | ---          | ---                                                                                                                   |

## 4.3 Author / Publisher Module

### 4.3.1 Account & Organisation

| **REQ ID**   | **Priority** | **Requirement**                                                                                                                      |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **FR-A-001** | **MUST**     | The system shall allow an individual author to register and manage a personal publishing account.                                    |
| ---          | ---          | ---                                                                                                                                  |
| **FR-A-002** | **MUST**     | The system shall allow a publisher to create an organisation account with a brand name, logo, and description.                       |
| ---          | ---          | ---                                                                                                                                  |
| **FR-A-003** | **MUST**     | The system shall allow the publisher account owner to invite team members and assign roles: Owner, Admin, Editor, Finance, Uploader. |
| ---          | ---          | ---                                                                                                                                  |
| **FR-A-004** | **MUST**     | The system shall display a verified author badge on profiles and title pages after admin verification.                               |
| ---          | ---          | ---                                                                                                                                  |
| **FR-A-005** | **SHOULD**   | The system shall allow authors to customise their public profile - bio, photo, genres, social links, website URL.                    |
| ---          | ---          | ---                                                                                                                                  |
| **FR-A-006** | **MUST**     | The system shall allow authors to view their follower count and list on their profile dashboard.                                     |
| ---          | ---          | ---                                                                                                                                  |

### 4.3.2 Content Upload & Management

| **REQ ID**   | **Priority** | **Requirement**                                                                                                                                                           |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-A-010** | **MUST**     | The system shall allow authors to upload eBook files in EPUB and PDF format.                                                                                              |
| ---          | ---          | ---                                                                                                                                                                       |
| **FR-A-011** | **MUST**     | The system shall allow authors to upload audiobook files in MP3 and M4B format.                                                                                           |
| ---          | ---          | ---                                                                                                                                                                       |
| **FR-A-012** | **MUST**     | The system shall allow authors to upload supplementary materials - reading guides, author notes, discussion questions.                                                    |
| ---          | ---          | ---                                                                                                                                                                       |
| **FR-A-013** | **MUST**     | The system shall validate uploaded files for format compliance and size limits before accepting them.                                                                     |
| ---          | ---          | ---                                                                                                                                                                       |
| **FR-A-014** | **MUST**     | The system shall allow authors to manually enter or auto-fill metadata via ISBN lookup - title, subtitle, author(s), synopsis, genre tags, cover image, publication date. |
| ---          | ---          | ---                                                                                                                                                                       |
| **FR-A-015** | **MUST**     | The system shall allow authors to upload a cover image and apply basic crop and resize within the upload interface.                                                       |
| ---          | ---          | ---                                                                                                                                                                       |
| **FR-A-016** | **MUST**     | The system shall allow authors to save a title as a draft before submitting for review.                                                                                   |
| ---          | ---          | ---                                                                                                                                                                       |
| **FR-A-017** | **MUST**     | The system shall allow authors to submit titles to the admin review queue for publication approval.                                                                       |
| ---          | ---          | ---                                                                                                                                                                       |
| **FR-A-018** | **MUST**     | The system shall allow authors to update or replace a file for an already-published title without losing its access or review history.                                    |
| ---          | ---          | ---                                                                                                                                                                       |
| **FR-A-019** | **MUST**     | The system shall allow authors to schedule a title for future publication on a specified date and time.                                                                   |
| ---          | ---          | ---                                                                                                                                                                       |
| **FR-A-020** | **MUST**     | The system shall allow authors to unpublish or temporarily withdraw a title at any time.                                                                                  |
| ---          | ---          | ---                                                                                                                                                                       |
| **FR-A-021** | **SHOULD**   | The system shall support bulk upload of multiple titles with a single metadata CSV or ONIX feed.                                                                          |
| ---          | ---          | ---                                                                                                                                                                       |
| **FR-A-022** | **SHOULD**   | The system shall allow authors to group titles into a series with a series name and reading order.                                                                        |
| ---          | ---          | ---                                                                                                                                                                       |
| **FR-A-023** | **SHOULD**   | The system shall allow authors to create promotional bundles from multiple titles.                                                                                        |
| ---          | ---          | ---                                                                                                                                                                       |

### 4.3.3 Rights & Licensing

| **REQ ID**   | **Priority** | **Requirement**                                                                                                                         |
| ------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-A-030** | **MUST**     | The system shall allow authors to choose a distribution model per title: subscription-only, individual purchase, or both.               |
| ---          | ---          | ---                                                                                                                                     |
| **FR-A-031** | **MUST**     | The system shall allow authors to set a simultaneous user limit per title - 1, 3, 5, 10, or unlimited concurrent readers.               |
| ---          | ---          | ---                                                                                                                                     |
| **FR-A-032** | **MUST**     | The system shall allow authors to define loan duration for library-model titles: 7, 14, 21, or 30 days.                                 |
| ---          | ---          | ---                                                                                                                                     |
| **FR-A-033** | **MUST**     | The system shall allow authors to set geo-restrictions - define which countries or regions can access a title.                          |
| ---          | ---          | ---                                                                                                                                     |
| **FR-A-034** | **MUST**     | The system shall allow authors to configure DRM per title - apply platform DRM, apply custom DRM, or waive DRM.                         |
| ---          | ---          | ---                                                                                                                                     |
| **FR-A-035** | **SHOULD**   | The system shall allow authors to set a title expiry - auto-withdraw after a defined number of total loans or a specific calendar date. |
| ---          | ---          | ---                                                                                                                                     |
| **FR-A-036** | **SHOULD**   | The system shall allow authors to configure a time-limited promotional free-access window with a defined start and end date.            |
| ---          | ---          | ---                                                                                                                                     |

### 4.3.4 Analytics & Reporting

| **REQ ID**   | **Priority** | **Requirement**                                                                                                                                           |
| ------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-A-040** | **MUST**     | The system shall provide authors with a real-time dashboard showing total reads, active readers, downloads, completions, and hold queue counts per title. |
| ---          | ---          | ---                                                                                                                                                       |
| **FR-A-041** | **MUST**     | The system shall show reader engagement metrics - average read time, completion rate, and chapter-level drop-off points.                                  |
| ---          | ---          | ---                                                                                                                                                       |
| **FR-A-042** | **SHOULD**   | The system shall display a geographic breakdown of readership by country and city.                                                                        |
| ---          | ---          | ---                                                                                                                                                       |
| **FR-A-043** | **SHOULD**   | The system shall show search appearance count and click-through rate for each title.                                                                      |
| ---          | ---          | ---                                                                                                                                                       |
| **FR-A-044** | **SHOULD**   | The system shall allow authors to compare performance across titles and over custom date ranges.                                                          |
| ---          | ---          | ---                                                                                                                                                       |
| **FR-A-045** | **SHOULD**   | The system shall allow authors to download reports in CSV or PDF format.                                                                                  |
| ---          | ---          | ---                                                                                                                                                       |
| **FR-A-046** | **SHOULD**   | The system shall allow authors to schedule automated report delivery to their email on a weekly or monthly basis.                                         |
| ---          | ---          | ---                                                                                                                                                       |

### 4.3.5 Revenue & Royalties

| **REQ ID**   | **Priority** | **Requirement**                                                                                                                          |
| ------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-A-050** | **MUST**     | The system shall display a royalty earnings dashboard showing total earnings, per-title breakdown, and pending payouts.                  |
| ---          | ---          | ---                                                                                                                                      |
| **FR-A-051** | **MUST**     | The system shall clearly display the royalty calculation formula - reads counted, rate applied, payout computed - for full transparency. |
| ---          | ---          | ---                                                                                                                                      |
| **FR-A-052** | **MUST**     | The system shall maintain a full payout history with date, amount, and payment method.                                                   |
| ---          | ---          | ---                                                                                                                                      |
| **FR-A-053** | **MUST**     | The system shall allow authors to configure their preferred payout method: bank transfer, PayPal, or mobile banking.                     |
| ---          | ---          | ---                                                                                                                                      |
| **FR-A-054** | **MUST**     | The system shall allow authors to set a minimum payout threshold before a transfer is triggered.                                         |
| ---          | ---          | ---                                                                                                                                      |
| **FR-A-055** | **SHOULD**   | The system shall allow authors to generate and download invoices for each payout.                                                        |
| ---          | ---          | ---                                                                                                                                      |
| **FR-A-056** | **SHOULD**   | The system shall store tax documents - W-8, W-9, VAT details - securely in the author account.                                           |
| ---          | ---          | ---                                                                                                                                      |
| **FR-A-057** | **COULD**    | The system shall display a revenue split breakdown for co-authored or co-published titles.                                               |
| ---          | ---          | ---                                                                                                                                      |

### 4.3.6 Promotion & Marketing

| **REQ ID**   | **Priority** | **Requirement**                                                                                                                 |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **FR-A-060** | **SHOULD**   | The system shall allow authors to request a featured placement or sponsored shelf position (subject to admin approval and fee). |
| ---          | ---          | ---                                                                                                                             |
| **FR-A-061** | **SHOULD**   | The system shall automatically push new release notifications to all readers who follow the author.                             |
| ---          | ---          | ---                                                                                                                             |
| **FR-A-062** | **SHOULD**   | The system shall allow authors to set up a pre-order listing with a release date countdown displayed to readers.                |
| ---          | ---          | ---                                                                                                                             |
| **FR-A-063** | **SHOULD**   | The system shall allow authors to generate affiliate tracking links for use in external marketing.                              |
| ---          | ---          | ---                                                                                                                             |
| **FR-A-064** | **COULD**    | The system shall provide an embeddable title widget (HTML snippet) that authors can place on external websites.                 |
| ---          | ---          | ---                                                                                                                             |

### 4.3.7 Community & Engagement

| **REQ ID**   | **Priority** | **Requirement**                                                                                                                               |
| ------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-A-070** | **SHOULD**   | The system shall allow authors to post a public reply to reader reviews on their titles.                                                      |
| ---          | ---          | ---                                                                                                                                           |
| **FR-A-071** | **SHOULD**   | The system shall allow authors to schedule and host virtual Q&A events through the platform.                                                  |
| ---          | ---          | ---                                                                                                                                           |
| **FR-A-072** | **SHOULD**   | The system shall allow authors to upload a book club resource kit - discussion guide, reading notes, author commentary - attached to a title. |
| ---          | ---          | ---                                                                                                                                           |
| **FR-A-073** | **SHOULD**   | The system shall allow authors to send a broadcast announcement to their followers via the platform's integrated notification system.         |
| ---          | ---          | ---                                                                                                                                           |

## 4.4 Admin / Staff Module

### 4.4.1 User Management

| **REQ ID**    | **Priority** | **Requirement**                                                                                                       |
| ------------- | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| **FR-AD-001** | **MUST**     | The system shall allow admins to view, search, filter, and edit all user accounts.                                    |
| ---           | ---          | ---                                                                                                                   |
| **FR-AD-002** | **MUST**     | The system shall allow admins to suspend, unsuspend, or permanently delete any user account.                          |
| ---           | ---          | ---                                                                                                                   |
| **FR-AD-003** | **MUST**     | The system shall allow admins to manually reset passwords and verify email addresses on behalf of users.              |
| ---           | ---          | ---                                                                                                                   |
| **FR-AD-004** | **MUST**     | The system shall allow admins to assign and modify user roles and subscription plans manually.                        |
| ---           | ---          | ---                                                                                                                   |
| **FR-AD-005** | **SHOULD**   | The system shall allow admins to bulk import users via CSV with role assignment.                                      |
| ---           | ---          | ---                                                                                                                   |
| **FR-AD-006** | **MUST**     | The system shall allow admins to view a full activity log for any user account - logins, reads, purchases, downloads. |
| ---           | ---          | ---                                                                                                                   |
| **FR-AD-007** | **SHOULD**   | The system shall allow admins to flag accounts for investigation with an internal note.                               |
| ---           | ---          | ---                                                                                                                   |

### 4.4.2 Catalogue Management

| **REQ ID**    | **Priority** | **Requirement**                                                                                                                             |
| ------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-AD-010** | **MUST**     | The system shall maintain a review queue of all author/publisher-submitted titles awaiting approval.                                        |
| ---           | ---          | ---                                                                                                                                         |
| **FR-AD-011** | **MUST**     | The system shall allow admins to approve, reject, or request revisions on any queued title, with a mandatory reason/message to the author.  |
| ---           | ---          | ---                                                                                                                                         |
| **FR-AD-012** | **MUST**     | The system shall allow admins to edit metadata for any title in the catalogue.                                                              |
| ---           | ---          | ---                                                                                                                                         |
| **FR-AD-013** | **MUST**     | The system shall allow admins to remove any title from the catalogue immediately.                                                           |
| ---           | ---          | ---                                                                                                                                         |
| **FR-AD-014** | **MUST**     | The system shall allow admins to create and manage curated shelves, staff picks, and featured collections.                                  |
| ---           | ---          | ---                                                                                                                                         |
| **FR-AD-015** | **SHOULD**   | The system shall allow admins to run a catalogue audit - flagging titles with missing metadata, broken file links, or expired DRM licences. |
| ---           | ---          | ---                                                                                                                                         |
| **FR-AD-016** | **SHOULD**   | The system shall support batch metadata editing across multiple titles simultaneously.                                                      |
| ---           | ---          | ---                                                                                                                                         |

### 4.4.3 Subscription & Financial Admin

| **REQ ID**    | **Priority** | **Requirement**                                                                                                                           |
| ------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-AD-020** | **MUST**     | The system shall allow admins to create, edit, and archive subscription plans including price, features, trial period, and device limits. |
| ---           | ---          | ---                                                                                                                                       |
| **FR-AD-021** | **MUST**     | The system shall allow admins to create and manage promo codes - discount type, value, usage limit, and expiry date.                      |
| ---           | ---          | ---                                                                                                                                       |
| **FR-AD-022** | **MUST**     | The system shall allow admins to view all royalty payout requests and approve or hold them.                                               |
| ---           | ---          | ---                                                                                                                                       |
| **FR-AD-023** | **MUST**     | The system shall allow admins to set and update platform-wide royalty rates and commission percentages per content type.                  |
| ---           | ---          | ---                                                                                                                                       |
| **FR-AD-024** | **SHOULD**   | The system shall allow admins to process manual refunds for any reader subscription payment.                                              |
| ---           | ---          | ---                                                                                                                                       |
| **FR-AD-025** | **SHOULD**   | The system shall allow admins to manage institutional subscription contracts - billing, renewal, and access level.                        |
| ---           | ---          | ---                                                                                                                                       |
| **FR-AD-026** | **SHOULD**   | The system shall generate financial summaries - MRR, total payouts, platform revenue - for any selected date range.                       |
| ---           | ---          | ---                                                                                                                                       |

### 4.4.4 Content Moderation

| **REQ ID**    | **Priority** | **Requirement**                                                                                                             |
| ------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **FR-AD-030** | **MUST**     | The system shall maintain a moderation queue of flagged reviews, comments, and community posts.                             |
| ---           | ---          | ---                                                                                                                         |
| **FR-AD-031** | **MUST**     | The system shall allow staff to approve or remove flagged content with an internal moderation note.                         |
| ---           | ---          | ---                                                                                                                         |
| **FR-AD-032** | **MUST**     | The system shall allow admins to issue a formal warning to a user with a logged record of the warning.                      |
| ---           | ---          | ---                                                                                                                         |
| **FR-AD-033** | **MUST**     | The system shall allow admins to process DMCA takedown requests - review, action, and notify submitter and affected author. |
| ---           | ---          | ---                                                                                                                         |
| **FR-AD-034** | **SHOULD**   | The system shall allow admins to publish and version-control the platform's community guidelines document.                  |
| ---           | ---          | ---                                                                                                                         |

### 4.4.5 Events Management

| **REQ ID**    | **Priority** | **Requirement**                                                                                                  |
| ------------- | ------------ | ---------------------------------------------------------------------------------------------------------------- |
| **FR-AD-040** | **SHOULD**   | The system shall allow admins to create, publish, and manage platform events - webinars, author Q&As, workshops. |
| ---           | ---          | ---                                                                                                              |
| **FR-AD-041** | **SHOULD**   | The system shall display events on a public calendar accessible to readers and guests.                           |
| ---           | ---          | ---                                                                                                              |
| **FR-AD-042** | **SHOULD**   | The system shall track event RSVPs and send automated reminders to attendees 24 hours before the event.          |
| ---           | ---          | ---                                                                                                              |
| **FR-AD-043** | **COULD**    | The system shall allow admins to archive completed events with recordings, transcripts, and resource materials.  |
| ---           | ---          | ---                                                                                                              |

### 4.4.6 Platform Analytics

| **REQ ID**    | **Priority** | **Requirement**                                                                                                                      |
| ------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **FR-AD-050** | **MUST**     | The system shall provide an admin analytics dashboard showing total users, active subscribers, total reads, catalogue size, and MRR. |
| ---           | ---          | ---                                                                                                                                  |
| **FR-AD-051** | **MUST**     | The system shall display subscription analytics - new subscribers, cancellations, upgrades, downgrades, and churn rate over time.    |
| ---           | ---          | ---                                                                                                                                  |
| **FR-AD-052** | **SHOULD**   | The system shall display reader engagement metrics - DAU, MAU, average session length, and retention rates.                          |
| ---           | ---          | ---                                                                                                                                  |
| **FR-AD-053** | **SHOULD**   | The system shall display search analytics - top queries, zero-result queries, and most-used filters.                                 |
| ---           | ---          | ---                                                                                                                                  |
| **FR-AD-054** | **SHOULD**   | The system shall allow admins to build custom reports with date range filters and export to CSV or PDF.                              |
| ---           | ---          | ---                                                                                                                                  |
| **FR-AD-055** | **COULD**    | The system shall support scheduling automated report delivery to specified admin email addresses.                                    |
| ---           | ---          | ---                                                                                                                                  |

### 4.4.7 System Configuration

| **REQ ID**    | **Priority** | **Requirement**                                                                                                                       |
| ------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-AD-060** | **MUST**     | The system shall allow admins to configure global platform settings - supported file formats, max file sizes, default loan durations. |
| ---           | ---          | ---                                                                                                                                   |
| **FR-AD-061** | **MUST**     | The system shall allow admins to manage third-party authentication providers - enable/disable Google, Facebook , SSO/SAML.            |
| ---           | ---          | ---                                                                                                                                   |
| **FR-AD-062** | **MUST**     | The system shall allow admins to edit and preview all email notification templates.                                                   |
| ---           | ---          | ---                                                                                                                                   |
| **FR-AD-063** | **MUST**     | The system shall allow admins to update the Terms of Service, Privacy Policy, and Cookie Policy with version tracking.                |
| ---           | ---          | ---                                                                                                                                   |
| **FR-AD-064** | **SHOULD**   | The system shall support feature flag management - enable or disable specific features per user group or subscription tier.           |
| ---           | ---          | ---                                                                                                                                   |
| **FR-AD-065** | **SHOULD**   | The system shall allow admins to manage API keys and webhook endpoints for third-party integrations.                                  |
| ---           | ---          | ---                                                                                                                                   |

### 4.4.8 Security & Compliance

| **REQ ID**    | **Priority** | **Requirement**                                                                                                                                          |
| ------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-AD-070** | **MUST**     | The system shall maintain a full, immutable audit log of all admin and staff actions - searchable and exportable.                                        |
| ---           | ---          | ---                                                                                                                                                      |
| **FR-AD-071** | **MUST**     | The system shall process GDPR/PDPA data subject requests - export or permanently delete all personal data associated with a user account within 30 days. |
| ---           | ---          | ---                                                                                                                                                      |
| **FR-AD-072** | **MUST**     | The system shall alert admins via email and dashboard when suspicious activity is detected - brute force login attempts, unusual download volumes.       |
| ---           | ---          | ---                                                                                                                                                      |
| **FR-AD-073** | **SHOULD**   | The system shall allow admins to configure session timeout duration and enforce 2FA for all admin accounts.                                              |
| ---           | ---          | ---                                                                                                                                                      |
| **FR-AD-074** | **SHOULD**   | The system shall generate a monthly security compliance report flagging unresolved incidents or policy gaps.                                             |
| ---           | ---          | ---                                                                                                                                                      |
| **FR-AD-075** | **SHOULD**   | The system shall enforce configurable data retention and automated deletion schedules for inactive accounts and expired content.                         |
| ---           | ---          | ---                                                                                                                                                      |

# 5\. Non-Functional Requirements

## 5.1 Performance Requirements

| **REQ ID**    | **Priority** | **Requirement**                                                                                                            |
| ------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **NFR-P-001** | **MUST**     | Page load time for all public-facing pages shall be under 2 seconds on a standard broadband connection (50 Mbps).          |
| ---           | ---          | ---                                                                                                                        |
| **NFR-P-002** | **MUST**     | Search results shall be returned within 500 milliseconds for standard queries.                                             |
| ---           | ---          | ---                                                                                                                        |
| **NFR-P-003** | **MUST**     | The reading engine shall load the first page of an eBook within 3 seconds on the first access.                             |
| ---           | ---          | ---                                                                                                                        |
| **NFR-P-004** | **MUST**     | The platform shall support at least 500 concurrent users during the initial launch period without performance degradation. |
| ---           | ---          | ---                                                                                                                        |
| **NFR-P-005** | **SHOULD**   | The platform shall scale to support 10,000 concurrent users within 12 months via horizontal scaling.                       |
| ---           | ---          | ---                                                                                                                        |
| **NFR-P-006** | **SHOULD**   | API response times shall not exceed 300ms at the 95th percentile under normal load.                                        |
| ---           | ---          | ---                                                                                                                        |

## 5.2 Security Requirements

| **REQ ID**    | **Priority** | **Requirement**                                                                                                                     |
| ------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **NFR-S-001** | **MUST**     | All data in transit shall be encrypted using TLS 1.2 or higher (HTTPS enforced across the entire platform).                         |
| ---           | ---          | ---                                                                                                                                 |
| **NFR-S-002** | **MUST**     | All user passwords shall be hashed using bcrypt with a minimum cost factor of 12.                                                   |
| ---           | ---          | ---                                                                                                                                 |
| **NFR-S-003** | **MUST**     | All API endpoints shall require valid JWT authentication except explicitly public endpoints.                                        |
| ---           | ---          | ---                                                                                                                                 |
| **NFR-S-004** | **MUST**     | Rate limiting shall be applied to all authentication endpoints - maximum 10 failed login attempts per IP per 15 minutes.            |
| ---           | ---          | ---                                                                                                                                 |
| **NFR-S-005** | **MUST**     | All uploaded content files shall be stored in a private cloud bucket (S3 or equivalent) - never publicly accessible via direct URL. |
| ---           | ---          | ---                                                                                                                                 |
| **NFR-S-006** | **MUST**     | All content served to readers shall be delivered via time-limited signed URLs (expiry: 1 hour).                                     |
| ---           | ---          | ---                                                                                                                                 |
| **NFR-S-007** | **MUST**     | All admin actions shall be logged to an immutable audit trail.                                                                      |
| ---           | ---          | ---                                                                                                                                 |
| **NFR-S-008** | **MUST**     | The platform shall pass an OWASP Top 10 vulnerability assessment before launch.                                                     |
| ---           | ---          | ---                                                                                                                                 |
| **NFR-S-009** | **SHOULD**   | Penetration testing shall be conducted by an independent party before the production launch.                                        |
| ---           | ---          | ---                                                                                                                                 |

## 5.3 Reliability & Availability

| **REQ ID**    | **Priority** | **Requirement**                                                                                                     |
| ------------- | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| **NFR-R-001** | **MUST**     | The platform shall target 99.5% uptime (measured monthly), excluding scheduled maintenance windows.                 |
| ---           | ---          | ---                                                                                                                 |
| **NFR-R-002** | **MUST**     | Scheduled maintenance windows shall be announced to users at least 48 hours in advance.                             |
| ---           | ---          | ---                                                                                                                 |
| **NFR-R-003** | **MUST**     | The system shall implement automated database backups every 24 hours with a minimum 30-day retention period.        |
| ---           | ---          | ---                                                                                                                 |
| **NFR-R-004** | **SHOULD**   | The system shall implement a read-replica database setup to ensure read availability during primary DB maintenance. |
| ---           | ---          | ---                                                                                                                 |
| **NFR-R-005** | **SHOULD**   | The maximum acceptable Recovery Time Objective (RTO) is 4 hours. Recovery Point Objective (RPO) is 24 hours.        |
| ---           | ---          | ---                                                                                                                 |

## 5.4 Scalability Requirements

| **REQ ID**     | **Priority** | **Requirement**                                                                                             |
| -------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| **NFR-SC-001** | **MUST**     | The application architecture shall support horizontal scaling of all stateless services.                    |
| ---            | ---          | ---                                                                                                         |
| **NFR-SC-002** | **MUST**     | File storage and CDN shall scale independently of application servers.                                      |
| ---            | ---          | ---                                                                                                         |
| **NFR-SC-003** | **SHOULD**   | Database connection pooling shall be configured to handle traffic spikes without exhausting connections.    |
| ---            | ---          | ---                                                                                                         |
| **NFR-SC-004** | **SHOULD**   | The search index shall be maintained on a separate Elasticsearch or Algolia service to scale independently. |
| ---            | ---          | ---                                                                                                         |

## 5.5 Accessibility Requirements

| **REQ ID**     | **Priority** | **Requirement**                                                                                       |
| -------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| **NFR-AC-001** | **MUST**     | All user-facing web interfaces shall comply with WCAG 2.1 Level AA standards.                         |
| ---            | ---          | ---                                                                                                   |
| **NFR-AC-002** | **MUST**     | The reading engine shall support keyboard-only navigation throughout.                                 |
| ---            | ---          | ---                                                                                                   |
| **NFR-AC-003** | **MUST**     | All images shall include descriptive alt text. Decorative images shall have empty alt attributes.     |
| ---            | ---          | ---                                                                                                   |
| **NFR-AC-004** | **MUST**     | Colour contrast ratios shall meet WCAG AA minimums (4.5:1 for normal text, 3:1 for large text).       |
| ---            | ---          | ---                                                                                                   |
| **NFR-AC-005** | **MUST**     | The platform shall be compatible with major screen readers - NVDA, JAWS, VoiceOver, TalkBack.         |
| ---            | ---          | ---                                                                                                   |
| **NFR-AC-006** | **SHOULD**   | The platform shall offer a high-contrast mode toggle accessible from the reader and account settings. |
| ---            | ---          | ---                                                                                                   |

## 5.6 Usability Requirements

| **REQ ID**    | **Priority** | **Requirement**                                                                                     |
| ------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| **NFR-U-001** | **MUST**     | A new reader shall be able to complete registration and access their first title within 5 minutes.  |
| ---           | ---          | ---                                                                                                 |
| **NFR-U-002** | **MUST**     | A new author shall be able to complete registration and upload their first title within 15 minutes. |
| ---           | ---          | ---                                                                                                 |
| **NFR-U-003** | **MUST**     | All primary actions (search, borrow, read) shall be reachable within 3 clicks from the homepage.    |
| ---           | ---          | ---                                                                                                 |
| **NFR-U-004** | **SHOULD**   | An interactive onboarding tutorial shall guide first-time readers and authors through key features. |
| ---           | ---          | ---                                                                                                 |

## 5.7 Internationalisation & Localisation

| **REQ ID**    | **Priority** | **Requirement**                                                                                       |
| ------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| **NFR-I-001** | **MUST**     | The platform UI shall support UTF-8 encoding to handle all international character sets.              |
| ---           | ---          | ---                                                                                                   |
| **NFR-I-002** | **SHOULD**   | The platform shall support multiple UI languages - minimum: English and Bengali at launch.            |
| ---           | ---          | ---                                                                                                   |
| **NFR-I-003** | **SHOULD**   | Date, time, and currency formats shall adapt to the user's locale.                                    |
| ---           | ---          | ---                                                                                                   |
| **NFR-I-004** | **COULD**    | The platform shall support right-to-left (RTL) text direction for Arabic and Hebrew language content. |
| ---           | ---          | ---                                                                                                   |

## 5.8 Maintainability

| **REQ ID**    | **Priority** | **Requirement**                                                                                                           |
| ------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **NFR-M-001** | **MUST**     | All backend code shall follow a consistent code style enforced by a linter (ESLint for Node.js).                          |
| ---           | ---          | ---                                                                                                                       |
| **NFR-M-002** | **MUST**     | Core business logic (royalty calculation, DRM enforcement, access control) shall have unit test coverage of at least 80%. |
| ---           | ---          | ---                                                                                                                       |
| **NFR-M-003** | **MUST**     | All API endpoints shall be documented in an OpenAPI 3.0 specification.                                                    |
| ---           | ---          | ---                                                                                                                       |
| **NFR-M-004** | **SHOULD**   | A CI/CD pipeline shall be configured to run tests and deploy automatically on merge to the main branch.                   |
| ---           | ---          | ---                                                                                                                       |
| **NFR-M-005** | **SHOULD**   | Environment-specific configuration shall use .env files - no hardcoded secrets in source code.                            |
| ---           | ---          | ---                                                                                                                       |

# 6\. External Interface Requirements

## 6.1 User Interface Requirements

- The web application shall be fully responsive - adapting to viewport widths from 320px (mobile) to 2560px (desktop).
- The mobile apps (iOS, Android) shall follow their respective platform design guidelines - Apple HIG and Material Design 3.
- The reading engine UI shall be distraction-free - minimal chrome, full content focus with controls accessible on demand.
- Dark mode shall be supported platform-wide (system preference detection + manual toggle).

## 6.2 Hardware Interfaces

- No dedicated hardware interfaces are required. The platform operates on standard web and mobile devices.
- The audiobook player shall integrate with device media controls (lock screen player controls on iOS and Android).

## 6.3 Software & API Interfaces

| **Integration**             | **Provider / Standard**                    | **Purpose**                                                     |
| --------------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| Payment Processing          | Stripe, PayPal                             | Subscription billing, individual purchases, author payouts      |
| ---                         | ---                                        | ---                                                             |
| Authentication (Social)     | Google OAuth 2.0, Facebook Sign-In         | Reader and author social login                                  |
| ---                         | ---                                        | ---                                                             |
| Authentication (Enterprise) | SAML 2.0 / OpenID Connect                  | Institutional SSO for partner organisations                     |
| ---                         | ---                                        | ---                                                             |
| Cloud Storage               | AWS S3 / Cloudflare R2                     | Storage for all uploaded eBook, audio, and image files          |
| ---                         | ---                                        | ---                                                             |
| CDN                         | Cloudflare                                 | Global content delivery, DDoS protection, signed URL generation |
| ---                         | ---                                        | ---                                                             |
| DRM                         | Readium LCP (or Adobe ACS)                 | Content protection for eBooks and audiobooks                    |
| ---                         | ---                                        | ---                                                             |
| Search                      | Elasticsearch / Algolia                    | Full-text catalogue search and filter                           |
| ---                         | ---                                        | ---                                                             |
| Email Delivery              | SendGrid / Resend                          | Transactional and marketing emails                              |
| ---                         | ---                                        | ---                                                             |
| Push Notifications          | Firebase Cloud Messaging (FCM)             | Mobile push notifications for iOS and Android                   |
| ---                         | ---                                        | ---                                                             |
| Analytics (Internal)        | Custom pipeline + ClickHouse               | Platform and author analytics data processing                   |
| ---                         | ---                                        | ---                                                             |
| Analytics (Product)         | Mixpanel / Amplitude                       | User behaviour analytics and funnel tracking                    |
| ---                         | ---                                        | ---                                                             |
| ISBN Lookup                 | Open Library API / ISBNdb                  | Auto-fill book metadata on author upload                        |
| ---                         | ---                                        | ---                                                             |
| Dictionary/Translation      | Merriam-Webster API / Google Translate API | In-reader word lookup and passage translation                   |
| ---                         | ---                                        | ---                                                             |
| Video Events                | Zoom API / Daily.co                        | Virtual author events and webinar hosting                       |
| ---                         | ---                                        | ---                                                             |

## 6.4 Communication Interfaces

- All communication between client and server shall use HTTPS (TLS 1.2+).
- Real-time features (reading position sync, notifications) shall use WebSockets or Server-Sent Events (SSE).
- Mobile apps shall communicate with the backend exclusively via the REST API (and GraphQL where applicable).
- File uploads shall use multipart/form-data over HTTPS with a 500 MB per-file size limit.

# 7\. System Constraints

- Solo developer constraint - the MVP must be limited to MUST-priority features only. SHOULD and COULD features are post-launch roadmap items.
- Budget constraint - infrastructure choices must be cost-efficient. Managed services (RDS, Elasticache) preferred over self-managed to reduce operational overhead.
- DRM constraint - DRM must be integrated from the start; retrofitting DRM to an existing content delivery system is not viable.
- Legal constraint - platform must comply with GDPR, PDPA (if targeting Bangladesh), and applicable copyright law (DMCA) before accepting any user data or content.
- Payment constraint - all payment processing must use PCI-DSS compliant providers. Card data must never touch StackRead servers.
- Content constraint - maximum file size per upload: 500 MB for eBooks and audiobooks. Maximum cover image size: 5 MB.
- Mobile constraint - native iOS and Android apps will be developed after the web platform is stable; mobile is Phase 5 of development.

# 8\. Assumptions & Dependencies

## 8.1 Assumptions

- All authors and publishers agree to the platform's content licensing terms upon registration.
- The royalty pool model will be implemented similarly to Kindle Unlimited - a monthly royalty fund distributed proportionally based on pages/minutes consumed.
- Email is the primary communication channel; SMS is not in scope for v1.
- The platform will launch in English first; additional languages will be added post-launch.
- Authors are responsible for ensuring they hold the rights to content they upload; the platform is not liable for infringing uploads but will respond promptly to DMCA notices.
- Free trial duration (if offered) will be 14 days; no credit card required for trial in the initial configuration.

## 8.2 Dependencies

- Stripe and PayPal APIs must remain available; any downtime will affect subscription and payout processing.
- Readium LCP or selected DRM provider licence must be obtained and configured before any content is published.
- AWS S3 or equivalent storage service must be configured before the file upload feature can be tested end-to-end.
- Firebase project must be set up and APNs certificates obtained before push notifications can be tested on mobile.
- Apple App Store and Google Play Developer accounts must be registered and approved before mobile app launch.

# 9\. Appendix - Requirement Traceability Matrix

The following table maps requirements to their corresponding modules, MoSCoW priority, and development phase.

| **REQ ID Range**         | **Module**                    | **Priority**          | **Phase** |
| ------------------------ | ----------------------------- | --------------------- | --------- |
| FR-G-001 to FR-G-056     | Guest Module                  | MUST / SHOULD         | Phase 2   |
| ---                      | ---                           | ---                   | ---       |
| FR-R-001 to FR-R-010     | Reader - Subscription         | MUST / SHOULD / COULD | Phase 2   |
| ---                      | ---                           | ---                   | ---       |
| FR-R-020 to FR-R-026     | Reader - Profile              | MUST / SHOULD         | Phase 2   |
| ---                      | ---                           | ---                   | ---       |
| FR-R-030 to FR-R-036     | Reader - Discovery            | MUST / SHOULD / COULD | Phase 2   |
| ---                      | ---                           | ---                   | ---       |
| FR-R-040 to FR-R-047     | Reader - Borrowing            | MUST / SHOULD         | Phase 2   |
| ---                      | ---                           | ---                   | ---       |
| FR-R-050 to FR-R-060     | Reader - Reading Engine       | MUST / SHOULD / COULD | Phase 2   |
| ---                      | ---                           | ---                   | ---       |
| FR-R-070 to FR-R-075     | Reader - Lists                | MUST / SHOULD / COULD | Phase 4   |
| ---                      | ---                           | ---                   | ---       |
| FR-R-080 to FR-R-084     | Reader - Goals & Gamification | SHOULD / COULD        | Phase 4   |
| ---                      | ---                           | ---                   | ---       |
| FR-R-090 to FR-R-098     | Reader - Community            | MUST / SHOULD / COULD | Phase 4   |
| ---                      | ---                           | ---                   | ---       |
| FR-R-100 to FR-R-103     | Reader - Research Tools       | SHOULD / COULD        | Phase 4   |
| ---                      | ---                           | ---                   | ---       |
| FR-A-001 to FR-A-006     | Author - Account              | MUST / SHOULD         | Phase 3   |
| ---                      | ---                           | ---                   | ---       |
| FR-A-010 to FR-A-023     | Author - Content Upload       | MUST / SHOULD         | Phase 3   |
| ---                      | ---                           | ---                   | ---       |
| FR-A-030 to FR-A-036     | Author - Rights & Licensing   | MUST / SHOULD         | Phase 3   |
| ---                      | ---                           | ---                   | ---       |
| FR-A-040 to FR-A-046     | Author - Analytics            | MUST / SHOULD         | Phase 3   |
| ---                      | ---                           | ---                   | ---       |
| FR-A-050 to FR-A-057     | Author - Revenue & Royalties  | MUST / SHOULD / COULD | Phase 3   |
| ---                      | ---                           | ---                   | ---       |
| FR-A-060 to FR-A-064     | Author - Promotion            | SHOULD / COULD        | Phase 4   |
| ---                      | ---                           | ---                   | ---       |
| FR-A-070 to FR-A-073     | Author - Community            | SHOULD                | Phase 4   |
| ---                      | ---                           | ---                   | ---       |
| FR-AD-001 to FR-AD-007   | Admin - User Management       | MUST / SHOULD         | Phase 2   |
| ---                      | ---                           | ---                   | ---       |
| FR-AD-010 to FR-AD-016   | Admin - Catalogue             | MUST / SHOULD         | Phase 2   |
| ---                      | ---                           | ---                   | ---       |
| FR-AD-020 to FR-AD-026   | Admin - Financial             | MUST / SHOULD         | Phase 3   |
| ---                      | ---                           | ---                   | ---       |
| FR-AD-030 to FR-AD-034   | Admin - Moderation            | MUST / SHOULD         | Phase 4   |
| ---                      | ---                           | ---                   | ---       |
| FR-AD-040 to FR-AD-043   | Admin - Events                | SHOULD / COULD        | Phase 4   |
| ---                      | ---                           | ---                   | ---       |
| FR-AD-050 to FR-AD-055   | Admin - Analytics             | MUST / SHOULD / COULD | Phase 3   |
| ---                      | ---                           | ---                   | ---       |
| FR-AD-060 to FR-AD-065   | Admin - System Config         | MUST / SHOULD         | Phase 2   |
| ---                      | ---                           | ---                   | ---       |
| FR-AD-070 to FR-AD-075   | Admin - Security              | MUST / SHOULD         | Phase 2   |
| ---                      | ---                           | ---                   | ---       |
| NFR-P-001 to NFR-P-006   | Performance                   | MUST / SHOULD         | Phase 6   |
| ---                      | ---                           | ---                   | ---       |
| NFR-S-001 to NFR-S-009   | Security                      | MUST / SHOULD         | Phase 6   |
| ---                      | ---                           | ---                   | ---       |
| NFR-R-001 to NFR-R-005   | Reliability                   | MUST / SHOULD         | Phase 6   |
| ---                      | ---                           | ---                   | ---       |
| NFR-AC-001 to NFR-AC-006 | Accessibility                 | MUST / SHOULD         | Phase 6   |
| ---                      | ---                           | ---                   | ---       |

## Priority Legend

| **Priority** | **Meaning**                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| MUST         | Required for MVP launch. Without this, the product cannot function or is non-compliant.                 |
| ---          | ---                                                                                                     |
| SHOULD       | Important feature that significantly improves the product. To be built in the next phase if not in MVP. |
| ---          | ---                                                                                                     |
| COULD        | Desirable feature to be built after MUST and SHOULD requirements are fully implemented.                 |
| ---          | ---                                                                                                     |
| WON'T (v1)   | Explicitly out of scope for v1. May be reconsidered in future versions.                                 |
| ---          | ---                                                                                                     |

## Document Revision History

| **Version** | **Date**   | **Author**    | **Changes**                                     |
| ----------- | ---------- | ------------- | ----------------------------------------------- |
| 1.0         | April 2026 | \[Your Name\] | Initial draft - complete SRS for StackRead v1.0 |
| ---         | ---        | ---           | ---                                             |

End of Document - StackRead Software Requirements Specification v1.0
