import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { app } from "../src/app";

let server: Server;
let baseUrl: string;

before(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("health endpoint returns service status without exposing secrets", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  const body = await response.json() as { status: string; service: string; timestamp: string };
  assert.equal(body.status, "ok");
  assert.equal(body.service, "gymsphere-api");
  assert.ok(Number.isFinite(Date.parse(body.timestamp)));
});

test("unknown API paths return JSON 404", async () => {
  const response = await fetch(`${baseUrl}/api/not-a-real-route`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "Route not found" });
});

test("workspace endpoints do not grant access without configured authentication", async () => {
  if (process.env.CLERK_SECRET_KEY) {
    // In configured environments, the Clerk middleware must reject requests without a session.
    const response = await fetch(`${baseUrl}/api/workspaces`);
    assert.equal(response.status, 401);
  } else {
    const response = await fetch(`${baseUrl}/api/workspaces`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "Authentication is not configured." });
  }
});

test("API rejects malformed JSON instead of processing it", async () => {
  const response = await fetch(`${baseUrl}/api/members`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-gym-id": "507f1f77bcf86cd799439011" },
    body: "{bad json"
  });
  assert.equal(response.status, 400);
});
