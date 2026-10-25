# Documentation index

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](DOCUMENTATION_INDEX.vi.md)

## Current guidance

Use these guides to set up, review and operate the current version.

- [Local setup](SETUP_GUIDE.md)
- [Capabilities and limits](CAPABILITIES.md)
- [Environments, secrets and domains](WRANGLER_CONFIG_GUIDE.md)
- [Canonical verification](TEST_GUIDE.md)
- [Test script scope](TEST_SCRIPTS.md)
- [Upgrades, staging and release](UPGRADE_RELEASE.md)
- [Current ESLint configuration](ESLINT_GUIDE.md)
- [Transactional email and Brevo](MANUAL_SEND_EMAIL_GUIDE.md)
- [Audit overview and contract](ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE.md)

## Historical design and examples

The following documents retain historical reference scope, not current runbooks. Their opening banners explain the limits. Do not infer available capabilities, current test counts, releases or deployment dates from old examples and claims. Current capability contracts and source take precedence. Examples that reset or write data require a deliberately prepared test environment.

- [🔍 **AUDIT SYSTEM API REFERENCE - TÀI LIỆU THAM KHẢO API**](AUDIT_API_REFERENCE.md)
- [🔧 **AUDIT SYSTEM CLOUDFLARE KV CONFIGURATION GUIDE**](AUDIT_KV_CONFIGURATION_GUIDE.md)
- [🔍 DATABASE INSPECTION GUIDE - HONO AUTH WORKER](DATABASE_INSPECTION_GUIDE.md)
- [DatabaseService - Complete Documentation & Quick Reference](DATABASE_SERVICE.md)
- [Complete Debug & Development Guide](DEBUG_DEVELOPMENT_GUIDE.md)
- [Dynamic Configuration Management Guide](DYNAMIC_CONFIG_GUIDE.md)
- [📧 EMAIL CHANGE VERIFICATION GUIDE - HONO AUTH WORKER](EMAIL_CHANGE_VERIFICATION_GUIDE.md)
- [🌍 HONO AUTH WORKER - MASTER i18n DOCUMENTATION](I18N_MASTER_GUIDE.md)
- [Complete Role Management System Guide](ROLE_COMPLETE_GUIDE.md)
- [Schemas Structure Documentation](SCHEMAS_GUIDE.md)
- [🚫 TOKEN BLACKLIST MANAGEMENT GUIDE - HONO AUTH WORKER](TOKEN_BLACKLIST_GUIDE.md)
- [🔐 TOKEN SECURITY COMPREHENSIVE GUIDE](TOKEN_SECURITY_COMPREHENSIVE_GUIDE.md)
- [Zod Validation Guide - Enterprise Audit System](ZOD_GUIDE.md)

## Pre-release reading path

1. Setup → capability contract → environment configuration.
2. Canonical verification → migrations/upgrades → staging acceptance.
3. Confirm domains, email, permissions and sessions; record the actual commit, CI results and deployment ID. Publish only after required acceptance is complete.
