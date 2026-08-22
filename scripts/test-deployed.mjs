const baseUrl = process.env.DEPLOYMENT_URL;

if (!baseUrl) {
  console.error("DEPLOYMENT_URL is required to run deployed smoke tests.");
  process.exit(1);
}

const normalizedUrl = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;

async function check(name, url, assertion) {
  try {
    const response = await fetch(url);
    const body = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${body.slice(0, 500)}`);
    assertion(body, response.headers.get("content-type"));
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

await check("homepage renders Receiptly", normalizedUrl, (body) => {
  if (!body.includes("Receiptly")) throw new Error('Response did not contain "Receiptly".');
});

await check(
  "receipts API responds with JSON",
  `${normalizedUrl}/api/receipts`,
  (body, contentType) => {
    if (!contentType?.includes("application/json"))
      throw new Error(`Expected JSON content type, received ${contentType ?? "none"}.`);
    const data = JSON.parse(body);
    if (!Array.isArray(data)) throw new Error("Expected the receipts API to return an array.");
  },
);

if (process.exitCode) process.exit(1);
