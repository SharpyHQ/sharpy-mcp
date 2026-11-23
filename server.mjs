#!/usr/bin/env node
// Stands in for Sharpy's MCP server where Sharpy for Mac isn't installed, such as a container.
// It lists Sharpy's tools and answers every call with how to get Sharpy. It reads no user data,
// writes nothing and opens no connection. The real server is the helper inside the app: start.sh.
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";

const read = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), "utf8"));
const { version } = read("./package.json");
const tools = read("./tools.json");

// The versions Sharpy's own server speaks, newest first.
const PROTOCOLS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const NOT_HERE =
  "Sharpy isn't available on this machine, so its tools are listed here but can't run. " +
  "They need Sharpy for Mac (macOS 14 or later, Apple silicon): https://getsharpy.com/download. " +
  "Once it is installed, point the client at /Applications/Sharpy.app/Contents/Helpers/sharpy-mcp.";

class RPCError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function answer(method, params) {
  switch (method) {
    case "initialize":
      return {
        protocolVersion: PROTOCOLS.includes(params.protocolVersion) ? params.protocolVersion : PROTOCOLS[0],
        capabilities: { tools: {} },
        serverInfo: { name: "sharpy", version },
        instructions: NOT_HERE,
      };
    case "ping":
      return {};
    case "tools/list":
      return { tools };
    case "tools/call":
      if (!tools.some((tool) => tool.name === params.name)) {
        throw new RPCError(-32602, `unknown tool '${params.name}'`);
      }
      return { content: [{ type: "text", text: NOT_HERE }], isError: params.name !== "sharpy_status" };
    case "resources/list":
      return { resources: [] };
    case "resources/templates/list":
      return { resourceTemplates: [] };
    case "prompts/list":
      return { prompts: [] };
    default:
      throw new RPCError(-32601, `unknown method '${method}'`);
  }
}

function handle(line) {
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    return { jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } };
  }
  const { id, method, params } = request ?? {};
  if (id === undefined || id === null) return; // a notification gets no reply
  try {
    return { jsonrpc: "2.0", id, result: answer(method, params ?? {}) };
  } catch (error) {
    return { jsonrpc: "2.0", id, error: { code: error.code ?? -32603, message: error.message } };
  }
}

// As a container's first process, Node ignores these unless something listens.
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => process.exit(0));

createInterface({ input: process.stdin }).on("line", (line) => {
  if (!line.trim()) return;
  const response = handle(line);
  if (response) process.stdout.write(JSON.stringify(response) + "\n");
});
