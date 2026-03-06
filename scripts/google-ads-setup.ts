/**
 * google-ads-setup.ts -- Guided setup for Google Ads API credentials.
 *
 * Usage:
 *   npx tsx scripts/google-ads-setup.ts              Check current credential status
 *   npx tsx scripts/google-ads-setup.ts auth-url      Generate OAuth2 consent URL
 *   npx tsx scripts/google-ads-setup.ts exchange-code  Exchange auth code for refresh token
 *   npx tsx scripts/google-ads-setup.ts validate       Validate credentials with a test API call
 */

import path from "path";
import fs from "fs";

const envPath = path.resolve(__dirname, "../dashboard/.env");
const envContent = fs.readFileSync(envPath, "utf-8");

function envVar(name: string): string {
  const match = envContent.match(new RegExp(`^${name}="?([^"\\n]*)"?`, "m"));
  return match?.[1] ?? "";
}

function setEnvVar(name: string, value: string): void {
  let content = fs.readFileSync(envPath, "utf-8");
  const regex = new RegExp(`^${name}="[^"]*"`, "m");
  if (regex.test(content)) {
    content = content.replace(regex, `${name}="${value}"`);
  } else {
    content += `\n${name}="${value}"`;
  }
  fs.writeFileSync(envPath, content, "utf-8");
}

const REQUIRED_VARS = [
  { name: "GOOGLE_ADS_CLIENT_ID", hint: "OAuth2 Client ID from Google Cloud Console" },
  { name: "GOOGLE_ADS_CLIENT_SECRET", hint: "OAuth2 Client Secret from Google Cloud Console" },
  { name: "GOOGLE_ADS_REFRESH_TOKEN", hint: "OAuth2 Refresh Token (generated via this script)" },
  { name: "GOOGLE_ADS_DEVELOPER_TOKEN", hint: "Developer Token from Google Ads API Center" },
  { name: "GOOGLE_ADS_CUSTOMER_ID", hint: "Google Ads Customer ID (10 digits, no dashes)" },
];

const OPTIONAL_VARS = [
  { name: "GOOGLE_ADS_LOGIN_CUSTOMER_ID", hint: "Manager account ID (only if using MCC)" },
];

const OAUTH_SCOPES = "https://www.googleapis.com/auth/adwords";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_ADS_API_BASE = "https://googleads.googleapis.com/v18";

const args = process.argv.slice(2);
const command = args[0] || "status";

function getFlag(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

function printSetupGuide(): void {
  console.log(`
========================================
  Google Ads API -- Setup Guide
========================================

Follow these steps to get your credentials:

STEP 1: Google Cloud Project
  1. Go to https://console.cloud.google.com/
  2. Create a new project (or select existing)
  3. Enable the "Google Ads API"
     - APIs & Services > Library > Search "Google Ads API" > Enable

STEP 2: OAuth2 Credentials
  1. APIs & Services > Credentials > Create Credentials > OAuth client ID
  2. Application type: "Desktop app"
  3. Copy the Client ID and Client Secret
  4. Paste them into dashboard/.env:
     GOOGLE_ADS_CLIENT_ID="your-client-id"
     GOOGLE_ADS_CLIENT_SECRET="your-client-secret"

STEP 3: Developer Token
  1. Sign in to Google Ads at https://ads.google.com
  2. Go to Tools & Settings > Setup > API Center
  3. If you do not see API Center, you may need to request access
  4. Copy the Developer Token (it starts as "Test" level -- fine for development)
  5. Paste into dashboard/.env:
     GOOGLE_ADS_DEVELOPER_TOKEN="your-developer-token"

STEP 4: Customer ID
  1. In Google Ads, your Customer ID is shown at the top right (xxx-xxx-xxxx)
  2. Remove the dashes and paste into dashboard/.env:
     GOOGLE_ADS_CUSTOMER_ID="1234567890"

STEP 5: Generate Refresh Token
  After setting Client ID and Client Secret, run:
     npx tsx scripts/google-ads-setup.ts auth-url
  This gives you a URL. Open it in your browser, grant access, copy the auth code, then run:
     npx tsx scripts/google-ads-setup.ts exchange-code --code YOUR_AUTH_CODE

STEP 6: Validate
  Run: npx tsx scripts/google-ads-setup.ts validate
`);
}

function checkStatus(): void {
  console.log("\n  Google Ads API -- Credential Status\n");

  let allPresent = true;

  for (const v of REQUIRED_VARS) {
    const value = envVar(v.name);
    const status = value ? "SET" : "MISSING";
    const icon = value ? "[ok]" : "[!!]";
    console.log(`  ${icon} ${v.name}: ${status}`);
    if (!value) {
      console.log(`       ${v.hint}`);
      allPresent = false;
    }
  }

  for (const v of OPTIONAL_VARS) {
    const value = envVar(v.name);
    const status = value ? "SET" : "(not set)";
    console.log(`  [--] ${v.name}: ${status}`);
  }

  console.log();

  if (allPresent) {
    console.log("  All required credentials are configured.");
    console.log("  Run: npx tsx scripts/google-ads-setup.ts validate");
  } else {
    console.log("  Some credentials are missing. See the setup guide:");
    console.log("  Run: npx tsx scripts/google-ads-setup.ts guide");
  }
  console.log();
}

function generateAuthUrl(): void {
  const clientId = envVar("GOOGLE_ADS_CLIENT_ID");
  if (!clientId) {
    console.error("GOOGLE_ADS_CLIENT_ID is not set in dashboard/.env");
    console.error("Set it first, then run this command again.");
    process.exit(1);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
    response_type: "code",
    scope: OAUTH_SCOPES,
    access_type: "offline",
    prompt: "consent",
  });

  const url = `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;

  console.log("\n  Open this URL in your browser:\n");
  console.log(`  ${url}\n`);
  console.log("  Grant access, then copy the authorization code.");
  console.log("  Run:");
  console.log('  npx tsx scripts/google-ads-setup.ts exchange-code --code "YOUR_AUTH_CODE"\n');
}

async function exchangeCode(): Promise<void> {
  const code = getFlag("code");
  if (!code) {
    console.error("Required: --code <authorization_code>");
    process.exit(1);
  }

  const clientId = envVar("GOOGLE_ADS_CLIENT_ID");
  const clientSecret = envVar("GOOGLE_ADS_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    console.error("GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET must be set first.");
    process.exit(1);
  }

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();

  if (data.error) {
    console.error(`OAuth error: ${data.error} -- ${data.error_description}`);
    process.exit(1);
  }

  if (data.refresh_token) {
    setEnvVar("GOOGLE_ADS_REFRESH_TOKEN", data.refresh_token);
    console.log("\n  Refresh token obtained and saved to dashboard/.env");
    console.log(`  GOOGLE_ADS_REFRESH_TOKEN="${data.refresh_token}"\n`);
    console.log("  Now run: npx tsx scripts/google-ads-setup.ts validate\n");
  } else {
    console.error("No refresh_token in response. Try again with prompt=consent.");
    console.log(JSON.stringify(data, null, 2));
    process.exit(1);
  }
}

async function validate(): Promise<void> {
  const clientId = envVar("GOOGLE_ADS_CLIENT_ID");
  const clientSecret = envVar("GOOGLE_ADS_CLIENT_SECRET");
  const refreshToken = envVar("GOOGLE_ADS_REFRESH_TOKEN");
  const developerToken = envVar("GOOGLE_ADS_DEVELOPER_TOKEN");
  const customerId = envVar("GOOGLE_ADS_CUSTOMER_ID");

  const missing = [];
  if (!clientId) missing.push("GOOGLE_ADS_CLIENT_ID");
  if (!clientSecret) missing.push("GOOGLE_ADS_CLIENT_SECRET");
  if (!refreshToken) missing.push("GOOGLE_ADS_REFRESH_TOKEN");
  if (!developerToken) missing.push("GOOGLE_ADS_DEVELOPER_TOKEN");
  if (!customerId) missing.push("GOOGLE_ADS_CUSTOMER_ID");

  if (missing.length > 0) {
    console.error(`Missing credentials: ${missing.join(", ")}`);
    process.exit(1);
  }

  console.log("\n  Validating credentials...\n");

  // Step 1: Get access token
  console.log("  1. Obtaining access token...");
  const tokenRes = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    console.error(`  Token error: ${tokenData.error} -- ${tokenData.error_description}`);
    process.exit(1);
  }
  console.log("     Access token obtained.");

  // Step 2: Test API call -- list accessible customers
  console.log("  2. Testing API access...");
  const loginCustomerId = envVar("GOOGLE_ADS_LOGIN_CUSTOMER_ID");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${tokenData.access_token}`,
    "developer-token": developerToken,
    "Content-Type": "application/json",
  };
  if (loginCustomerId) {
    headers["login-customer-id"] = loginCustomerId;
  }

  const queryRes = await fetch(
    `${GOOGLE_ADS_API_BASE}/customers/${customerId}/googleAds:searchStream`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: "SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1",
      }),
    }
  );

  if (!queryRes.ok) {
    const errText = await queryRes.text();
    console.error(`  API error (${queryRes.status}): ${errText}`);
    process.exit(1);
  }

  const queryData = await queryRes.json();
  const customer = queryData?.[0]?.results?.[0]?.customer;

  if (customer) {
    console.log("     API access confirmed.\n");
    console.log("  ========================================");
    console.log("  Google Ads Account Details:");
    console.log(`    Account Name:  ${customer.descriptiveName}`);
    console.log(`    Customer ID:   ${customer.id}`);
    console.log(`    Currency:      ${customer.currencyCode}`);
    console.log(`    Time Zone:     ${customer.timeZone}`);
    console.log("  ========================================\n");
    console.log("  Setup complete. You can now use:");
    console.log("  npx tsx scripts/google-ads-client.ts <command>\n");
  } else {
    console.log("  API returned data but no customer info found.");
    console.log(JSON.stringify(queryData, null, 2));
  }
}

async function main() {
  switch (command) {
    case "status":
      checkStatus();
      break;
    case "guide":
      printSetupGuide();
      break;
    case "auth-url":
      generateAuthUrl();
      break;
    case "exchange-code":
      await exchangeCode();
      break;
    case "validate":
      await validate();
      break;
    default:
      console.error(
        "Usage: npx tsx scripts/google-ads-setup.ts <command>\n\n" +
        "Commands:\n" +
        "  status          Check which credentials are configured\n" +
        "  guide           Print step-by-step setup instructions\n" +
        "  auth-url        Generate OAuth2 consent URL\n" +
        "  exchange-code   Exchange auth code for refresh token (--code)\n" +
        "  validate        Test credentials with a live API call\n"
      );
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
