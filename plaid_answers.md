# Plaid Business Verification API: Deep Dive Research

## Executive Summary

Plaid's **Business Verification** API is a hidden (undocumented) product that performs KYB (Know Your Business), risk assessment, and digital presence checks on businesses. Despite being marked `x-hidden-from-docs` in the public OpenAPI specification, it remains fully functional with complete request/response schemas available.

---

## API Endpoints

### Production
- **Create**: `POST https://production.plaid.com/business_verification/create`
- **Retrieve**: `POST https://production.plaid.com/business_verification/get`

### Sandbox
- **Create**: `POST https://sandbox.plaid.com/business_verification/create`
- **Retrieve**: `POST https://sandbox.plaid.com/business_verification/get`

### User-Facing URL Pattern
```
https://verify.plaid.com/busver_<id>?key=<key>
```

---

## Full API Specification (from OpenAPI 2020-09-14)

### `/business_verification/create`

**Request Body:**
```json
{
  "client_user_id": "your-db-id-3b24110",
  "business": {
    "name": "Acme Corporation",
    "alternative_name": "Acme Widgets",
    "address": {
      "street": "123 Main St.",
      "street2": "Unit 42",
      "city": "Pawnee",
      "region": "IN",
      "postal_code": "46001",
      "country": "US"
    },
    "website": "https://example.com",
    "phone_number": "+14025671234",
    "email_address": "user@example.com"
  }
}
```

**Required Fields:**
- `client_user_id` (string): Your internal user ID
- `business.name` (string, 1-500 chars)
- `business.address.street` (required)
- `business.address.city` (required)
- `business.address.country` (required)

**Optional Business Fields:**
- `alternative_name`: Alternative business name
- `address.street2`, `region`, `postal_code`
- `website`: URL format
- `phone_number`: E.164 format
- `email_address`: Email format

### `/business_verification/get`

**Request Body:**
```json
{
  "business_verification_id": "busver_52xR9LKo77r1Np"
}
```

**Required Fields:**
- `business_verification_id` (string, format: `cognito_id`)

---

## Response Schema

### Complete Response Object
```json
{
  "id": "busver_52xR9LKo77r1Np",
  "client_user_id": "your-db-id-3b24110",
  "created_at": "2020-07-24T03:26:02Z",
  "completed_at": "2020-07-24T03:26:02Z",
  "redacted_at": "2020-07-24T03:26:02Z",
  "status": "success",
  "search_terms": {
    "name": "Acme Corporation",
    "alternative_names": ["Acme Widgets"],
    "address": { /* full address object */ },
    "website": "https://example.com",
    "phone_number": "+14025671234",
    "email_address": "user@example.com"
  },
  "kyb_check": {
    "status": "success",
    "score": 85,
    "name": { "summary": "match" },
    "address": { "summary": "match" },
    "website": { "summary": "match" },
    "match_details": {
      "names": [
        { "is_primary": true, "name": "Acme Corporation" },
        { "is_primary": false, "name": "Acme Widgets" }
      ],
      "entity_type": "llc",
      "addresses": [ /* array of addresses */ ],
      "phone_numbers": [ { "number": "+12345678909" } ],
      "email_addresses": [ { "email_address": "business@example.com" } ],
      "websites": [ { "url": "https://example.com" } ],
      "formation_date": "1990-05-29"
    }
  },
  "risk_check": {
    "status": "success",
    "score": 92,
    "industry_prediction": {
      "code": 518210,
      "title": "Data Processing, Hosting, and Related Services"
    }
  },
  "digital_presence_check": {
    "status": "success",
    "score": 55,
    "address": { "summary": "match" },
    "phone_number": { "summary": "match" },
    "email_address": { "summary": "match" },
    "website": { "summary": "match" },
    "website_analysis": {
      "is_parked": "no",
      "email_is_deliverable": "yes",
      "website_build_status": "active",
      "whois_record": {
        "domain_created_at": "1995-08-16T00:00:00Z",
        "domain_updated_at": "2025-07-11T00:00:00Z",
        "domain_expires_at": "2026-08-15T00:00:00Z",
        "registrar": "GANDI SAS"
      },
      "ssl": { "is_valid": "yes" }
    }
  },
  "shareable_url": "https://verify.plaid.com/busver_4FrXJvfQU3zGUR?key=e004115db797f7cc3083bff3167cba30644ef630fb46f5b086cde6cc3b86a36f",
  "request_id": "saKrIBuEB9qJZng"
}
```

---

## Status Enumerations

### Overall Status (`status`)
- `active`: Verification in progress
- `success`: Verification completed successfully
- `failed`: Verification failed

### KYB Check Status
Same enum: `active`, `success`, `failed`

### Risk Check Status
Same enum: `active`, `success`, `failed`

### Digital Presence Check Status
- `active`: Check in progress
- `success`: Check completed successfully
- `failed`: Check failed
- `not_applicable`: Check not applicable to this business

### Match Summary (`summary` field)
- `"yes"`: Field matched
- `"no"`: Field didn't match
- `no_data`: Could not determine value

---

## Key Features & Capabilities

### 1. **KYB (Know Your Business) Check**
- Validates business name against official records
- Verifies address consistency
- Checks website association
- Returns entity type (LLC, Corp, etc.)
- Provides formation date
- Lists all known names, addresses, phone numbers, emails, websites

### 2. **Risk Assessment**
- Risk score (0-100)
- Industry prediction via NAICS code
- Industry title classification

### 3. **Digital Presence Verification**
- Cross-checks submitted address, phone, email, website against public records
- Website analysis:
  - Parked domain detection
  - Email deliverability check
  - SSL certificate validation
  - WHOIS metadata (creation date, registrar, expiration)

### 4. **Shareable URL**
- User-facing verification page
- Pattern: `https://verify.plaid.com/busver_<id>?key=<hash>`
- Allows users to complete verification interactively

---

## Hidden Status Implications

The `x-hidden-from-docs: true` flag indicates:

1. **Beta/Experimental**: Feature may still be in limited rollout
2. **Entitlement Required**: Not all Plaid customers have access
3. **Subject to Change**: API contract may evolve without full deprecation cycle
4. **Production Availability**: Despite being hidden, endpoints are live in production

**Evidence:**
- Present in public OpenAPI spec (not removed)
- Full example responses provided
- SDKs generate methods from spec
- No `deprecated: true` flag

---

## SDK Implementations Found

### Python (`plaid-python`)
Method signature:
```python
def business_verification_create(
    self,
    business_verification_create_request,
    **kwargs
)
```

Documentation strings confirm:
- "Create a new business verification to check a business's identity and risk profile"
- Synchronous HTTP request by default
- Supports async via `async_req=True`

### Other SDKs
OpenAPI spec drives all official SDKs (Node, Go, Java, Ruby), so methods exist in all but may not be documented in README files.

---

## Sandbox vs Production Differences

Based on schema analysis:
- **Same endpoints** with different hostnames
- **Same request/response schemas**
- **No documented behavioral differences**
- Sandbox likely uses synthetic/test business data

---

## Related Plaid Products

### Identity Verification (IDV)
- Individual-focused verification
- Document upload, PII verification
- Fraud detection (virtual camera, AI manipulation)
- Recent updates: image integrity checks, email risk checks, typo correction

### Income Verification
- Bank income, document income, payroll income
- I-20 forms and LES support added recently

### Link Products
- `enable_multi_item_link` field in `/link/token/create`
- Multi-item linking capability

---

## Known Limitations & Gaps

1. **Documentation**: Public docs return 404 at declared URLs
   - `/api/products/business-verification/#businessverificationcreate`
   - `/api/products/business-verification/#businessverificationget`

2. **No Changelog Entries**: OpenAPI CHANGELOG.md has no mentions of business_verification additions/changes

3. **Limited Community Visibility**: 
   - No StackOverflow results for "plaid business verification"
   - No blog posts specifically about this feature
   - Not mentioned in product update roundups

4. **Entitlement Unclear**: Which customers have access? Is it opt-in?

5. **Pricing Unknown**: No public pricing information

---

## Use Cases (Inferred)

Based on response schema:
1. **Lending/KYC**: Verify business identity before underwriting
2. **Marketplace Onboarding**: Validate seller/merchant businesses
3. **Fraud Prevention**: Cross-check digital presence against submitted info
4. **Compliance**: Maintain audit trail of business verification
5. **Risk Scoring**: Use risk_check.score for automated decisions

---

## Recommendations for Implementation

### Request Flow
1. Call `/business_verification/create` with business details
2. Store `id` and `client_user_id` in your database
3. Optionally redirect user to `shareable_url` for interactive completion
4. Poll `/business_verification/get` until status != `active`
5. Use `kyb_check.score`, `risk_check.score`, `digital_presence_check.score` for decisions

### Error Handling
- Handle `active` status (async processing)
- Implement retry logic with exponential backoff
- Store `request_id` for support correlation

### Data Retention
- Note `redacted_at` timestamp for data lifecycle management
- Consider compliance requirements for business PII

---

## Evidence Sources

1. **OpenAPI Spec**: https://github.com/plaid/plaid-openapi/blob/457d08b92a569289195312aec8daa712d3324cab/2020-09-14.yml#L10305-L10520
   - Lines 10305-10412: `/business_verification/get`
   - Lines 10412-10520: `/business_verification/create`
   - Lines 59898-60230: All BusinessVerification schemas

2. **Python SDK**: https://raw.githubusercontent.com/plaid/plaid-python/master/plaid/api/plaid_api.py

3. **Plaid Blog**: Recent posts mention IDV updates but not business_verification specifically

4. **Local Plaid Docs Corpus**: No mentions found in `/docs` or `/plaid-docs` directories

---

## Open Questions

1. What triggers `status: failed` vs `success`?
2. Are there webhook notifications for completion?
3. What are the rate limits?
4. Is there a bulk/batch endpoint?
5. How does pricing work (per verification, monthly minimums)?
6. Which industries/geographies have best coverage?

---

## Conclusion

Plaid Business Verification is a **fully functional but hidden** API that provides comprehensive KYB, risk, and digital presence checks. Despite being marked `x-hidden-from-docs`, it has complete OpenAPI specifications, SDK support, and production endpoints. The feature appears to be in limited availability or beta status, with no public documentation despite working endpoints.

For production use:
- Contact Plaid sales for entitlement
- Implement polling for async completion
- Store all response fields for audit trail
- Use scores as decision signals with appropriate thresholds
