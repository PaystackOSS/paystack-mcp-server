# Paystack Developer Knowledge

## Documentation Index

For integration guides, best practices, and detailed documentation, use the Paystack LLM-friendly docs index:
https://paystack.com/docs/llms.txt

This index covers payments, transfers, terminal, guides, libraries, API reference, and API changelog.

## Code Snippets

Code snippets for Paystack API endpoints and integration guides are maintained in the PaystackOSS/doc-code-snippets repository. Snippets are available in JavaScript (Node.js), Shell/cURL, and PHP.

### Browsing Snippets
- API Reference snippets: https://github.com/PaystackOSS/doc-code-snippets/tree/main/src/api
- Documentation snippets: https://github.com/PaystackOSS/doc-code-snippets/tree/main/src/doc

### Fetching a Specific Snippet
Once you know the exact path from browsing, fetch the raw content at:
https://raw.githubusercontent.com/PaystackOSS/doc-code-snippets/main/src/api/{topic}/{action}/index.{js,sh}

For example:
- https://raw.githubusercontent.com/PaystackOSS/doc-code-snippets/main/src/api/transactions/initialize/index.js
- https://raw.githubusercontent.com/PaystackOSS/doc-code-snippets/main/src/api/transactions/initialize/index.sh

### Snippet Notes
- Snippets use placeholder values like "SECRET_KEY" or "YOUR_SECRET_KEY" — replace with actual test keys
- Not every endpoint has a snippet; if unavailable, construct the request from the operation details provided by the "get_paystack_operation" tool

## Payment Channels by Country

| Country | Currencies | Payment Channels |
|---------|----------|-----------------|
| Nigeria | NGN, USD | Cards (Visa, Mastercard, Verve, Amex), Bank Transfer, USSD, QR Code, Apple Pay |
| Ghana | GHS | Cards (Visa, Mastercard, Verve), Mobile Money (MTN, AirtelTigo, Telecel), Bank Transfer, QR Code |
| South Africa | ZAR | Cards (Visa, Mastercard, Verve, Amex), Apple Pay, QR Code |
| Kenya | KES, USD | Cards (Visa, Mastercard, Verve), Mobile Money (M-PESA, Airtel Money), Bank Transfers (Pesalink)
| Côte d'Ivoire | XOF | Cards (Visa, Mastercard, Verve), Mobile Money (MTN MoMo, Wave, Orange Money), Apple Pay |