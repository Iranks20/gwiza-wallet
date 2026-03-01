# Wallet+ OpenAPI – Integration Reference

**Spec:** `walletplus-openapi.json` (Wallet Microservice v1.4.0)  
**Purpose:** Map admin/app screens to APIs and field names for integration.

---

## Integration status

- **Done:** Countries (`/admin/settings/countries`), Currencies (`/admin/settings/currencies`), Transaction Operation Types (`/admin/settings/transaction-operation-types`), Profile Permissions (`/admin/settings/profile-permissions`). All use `src/api/client.ts` and `src/api/*.ts` + services.
- **TODO (country-configure, later):** KYC Tiers, Profile Types, Profile Type Groups, Group Permissions, Thresholds, Transaction Channels, System Accounts, Transaction Rules, Transaction Fees when under `/admin/settings/countries/:id/configure/...`.

---

## Base URL & Auth

- **Base URL:** `https://walletplus.qa.gwiza.co` (default). Override with `VITE_API_BASE_URL` in `.env`.
- **Auth:** None for now; Bearer/API key to be added later.

---

## Page → API Mapping (Admin)

| Our screen / feature | Tag in spec | List API | Get one | Create | Update | Delete |
|----------------------|-------------|----------|---------|--------|--------|--------|
| **Countries** (Settings) | Countries | `GET /opcos/` | `GET /opcos/{country_id}` | `POST /opcos/` | `PUT /opcos/{country_id}` | soft-delete (status inactive) |
| **Currencies** | Currencies | `GET /currencies/` | `GET /currencies/{currency_code}` | `POST /currencies/` | `PUT /currencies/{currency_code}` | `DELETE /currencies/{currency_code}` |
| **Transaction Operation Types** | Transaction Operation Types | `GET /txnoptypes/` | `GET /txnoptypes/{operation_type_id}` | `POST /txnoptypes/` | `PUT /txnoptypes/{operation_type_id}` | `DELETE /txnoptypes/{operation_type_id}` |
| **Profile Permissions** | Profile Permissions | `GET /profilepermissions/` | `GET /profilepermissions/{permission_id}` | `POST /profilepermissions/` | `PUT /profilepermissions/{permission_id}` | `DELETE /profilepermissions/{permission_id}` |
| **KYC Tiers** (Country configure) **TODO** | KYC Tiers | `GET /kyctiers/` | `GET /kyctiers/{kyc_tier_id}` | `POST /kyctiers/` | `PUT /kyctiers/{kyc_tier_id}` | ❌ no DELETE |
| **Profile Types** (Country configure) **TODO** | Profile Types | `GET /profiletypes/` | `GET /profiletypes/{profile_type_id}` | `POST /profiletypes/` | `PUT /profiletypes/{profile_type_id}` | ❌ no DELETE |
| **Profile Type Groups** (Country configure) **TODO** | Profile Type Groups | `GET /profiletypegroups/` | `GET /profiletypegroups/{profile_type_group_id}` | `POST /profiletypegroups/` | `PUT /profiletypegroups/{profile_type_group_id}` | ❌ no DELETE |
| **Profile Type Group Permissions** (matrix) | Profile Type Group Permissions | `GET /profiletypegrouppermissions/` | `GET /profiletypegrouppermissions/{assignment_id}` | `POST /profiletypegrouppermissions/` | `PUT /profiletypegrouppermissions/{assignment_id}` | `DELETE /profiletypegrouppermissions/{assignment_id}` |
| **Thresholds** (per group) | Profile Threshold Settings | `GET /profilethresholdsettings/` | `GET /profilethresholdsettings/{threshold_setting_id}` | `POST /profilethresholdsettings/` | `PUT /profilethresholdsettings/{threshold_setting_id}` | ❌ no DELETE |
| **Transaction Channels** | Transaction Channels | `GET /txnchannels/` | `GET /txnchannels/{txn_channel_id}` | `POST /txnchannels/` | `PUT /txnchannels/{txn_channel_id}` | ❌ no DELETE |
| **System Accounts** | System Accounts | `GET /systemaccounts/` | `GET /systemaccounts/{account_id}` | `POST /systemaccounts/` | `PUT /systemaccounts/{account_id}` | ❌ no DELETE |
| **Transaction Rules** | Transaction Rules | `GET /txnrules/` | `GET /txnrules/{rule_id}` | `POST /txnrules/` | `PUT /txnrules/{rule_id}` | ❌ no DELETE |
| **Transaction Fees** | Transaction Fees | `GET /txnfees/` | `GET /txnfees/{txn_fee_id}` | `POST /txnfees/` | `PUT /txnfees/{txn_fee_id}` | ❌ no DELETE |
| **Wallets** (admin list/detail) | Wallets | `GET /wallets/` | `GET /wallets/{wallet_id}` | `POST /wallets/` | `PUT /wallets/{wallet_id}` | ❌ no DELETE |
| **Transaction Register** | Wallet Transaction Register | `GET /txnregister/` | `GET /txnregister/{txn_id}` | `POST /txnregister/` | `PUT /txnregister/{txn_id}` | — |
| **Audit Logs** | Wallet Transaction Audit Logs | `GET /txnauditlogs/` | `GET /txnauditlogs/{record_id}` | — | — | — |
| **Fees Ledger** | (Other) | `GET /txnfeesledger/` | `GET /txnfeesledger/{entry_id}` | — | — | — |
| **Health / Ready** | — | `GET /health`, `GET /ready` | — | — | — | — |

---

## Key request/response field names (snake_case)

- **Countries (opcos):** `country_id`, `country_name`, `alpha2_code`, `alpha3_code`, `calling_code`, `flag`, `currency`, `country_is_active`.  
  Create/Update: `country_name`, `alpha2_code`, `calling_code`, `alpha3_code`, `flag`, `currency`, `country_is_active`.  
  **Create validations (enforced in Add Country modal):** `country_name` 4–255 chars, letters/numbers/spaces/hyphen/apostrophe only; `alpha2_code` exactly 2 uppercase letters; `alpha3_code` exactly 3 uppercase letters; `calling_code` optional `+` and 1–4 digits; `currency` must be selected from existing currencies (dropdown); `flag` optional, must be valid URL if provided. Backend requires `currency` (500 if missing). **`resp_code` 174:** In QA testing, the backend returns 174 for all create attempts (valid payloads with existing currencies). Likely a backend rule or feature restriction; contact backend team to confirm when country create is allowed.

- **KYC Tiers:** `kyc_tier_id`, `kyc_tier_name`, `kyc_tier_description`, `kyc_tier_is_active`.  
  (No `country_id` in tier in spec; confirm if tiers are global or per-country.)

- **Profile Types:** `profile_type_name`, `profile_type`, `profile_auth_type`, `login_counter_max_allowed_no`, `login_counter_reset_freq`, `limit_message`, `profile_type_is_active`.

- **Profile Type Groups:** `profile_type_id`, `profile_type_group_name`, `kyc_tier_id`, `profile_type_group_country`, `profile_type_group_currency`, `is_default`, `profile_type_group_is_active`.

- **Profile Permissions:** `permission_name`, `permission_scope`, `permission_tag`, `permission_is_active`.

- **Profile Threshold Settings:** Many fields including `profile_type_group_id`, `kyc_tier_id`, `country_id`, `currency_code`, `single_txn_min_value`, `single_txn_max_value`, `daily_txn_value_cap`, `monthly_txn_value_cap`, `threshold_setting_is_active`, etc.

- **Transaction Channels:** `txn_channel_id`, `txn_channel_type`, `txn_channel_name`, `txn_channel_display_name`, `txn_channel_country_id`, `txn_channel_currency`, `txn_channel_is_active`.

- **Transaction Rules:** `rule_id`, `rule_description`, `rule_country_id`, `profile_type_group_id`, `operation_type_id`, `operation_type_tag`, `src_country_id`, `src_currency`, `src_txn_channel_id`, `dest_country_id`, `dest_txn_channel_id`, `dest_currency`, `dest_type`, `charge_fee_to`, `rule_is_active`, etc.

- **Transaction Fees:** `txn_rule_id`, `amount_lower`, `amount_upper`, `fee_type`, `transaction_fee`, `txn_fee_rule_is_active`.

- **System Accounts:** `account_name`, `account_description`, `account_country_id`, `account_currency`, `is_active`. (Confirm if `account_wallet_id` is required or optional.)

- **Wallets:** List supports filters: `wallet_id`, `wallet_account_no`, `member_profile_id`, `member_id`, `linked_msisdn`, `wallet_status`, `wallet_country_id`, `wallet_currency_code`, `profile_type`, `profile_type_group_id`, date range, balance range, etc.

---

## Pagination

List endpoints return a wrapper with `data` and `pagination`. Common fields: `page`, `limit`, `total`, `totalPages`; some add `hasNext`, `hasPrev`. Query params: `page` (default 1), `limit` (default 10, max 100 where specified).

---

## Filter endpoints (by resource)

- **Thresholds:** `GET .../profiletypegroup/{profile_type_group_id}`, `.../kyctier/{kyc_tier_id}`, `.../country/{country_id}`, `.../currency/{currency_code}`, `.../status/{threshold_setting_is_active}`.
- **Transaction Rules:** `GET .../country/{country_id}`, `.../profile-type-group/{profile_type_group_id}`, `.../status/{is_active}`, `.../txn-channel/...`, etc.
- **Transaction Fees:** `GET .../transaction-rule/{txn_rule_id}`, `.../fee-type/{fee_type}`, `.../status/{is_active}`.
- **Audit Logs:** `GET .../txn/{txn_id}`, `.../action/{action}`, `.../date-range/{start_date}/{end_date}`, `.../user/{user_id}`, etc.
- **Fees Ledger:** `GET .../txn/{txn_id}`, `.../daterange/{start_date}/{end_date}`, `.../chargedto/{wallet_id}`, `.../creditedto/{wallet_id}`, `.../status/{status}`.
- **Transaction Register:** `GET .../wallet/{wallet_id}`, `.../wallet/{wallet_id}/{start_date}/{end_date}`.

---

## Things to confirm with lead dev

1. **Base URL & environment:** Where is the API hosted (per env)? Any proxy or CORS setup?
2. **Authentication:** How does the frontend authenticate (Bearer token, API key, session)? Where is the token stored and refreshed?
3. **Countries:** API uses **opcos** and `country_id`. Is there a numeric code we must send, or only alpha2/alpha3?
4. **KYC Tiers:** Tiers in the spec have no `country_id`. Are tiers global or per-country? If per-country, which endpoint or query param is used?
5. **Soft delete:** No DELETE for opcos, kyctiers, profiletypes, profiletypegroups, profilethresholdsettings, systemaccounts, txnchannels, txnrules, txnfees. Should we only toggle `*_is_active` (or equivalent) to “inactive”?
6. **Profile threshold settings:** Create body has many fields (`effective_from`, `effective_to`, `allow_negative_balance`, etc.). Which are required vs optional for our UI?
7. **System accounts:** Is `account_wallet_id` (or linked wallet) required on create, or can it be set later?
8. **Error format:** Standard error response shape (e.g. `resp_code`, `resp_msg`, validation errors) and HTTP status mapping.
9. **Idempotency / concurrency:** Any `If-Match` / version headers or ETags for PUTs?

---

*Generated for integration use. Update this doc when the spec or backend contract changes.*
