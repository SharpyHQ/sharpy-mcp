# Sharpy MCP server

The local MCP server inside [Sharpy](https://getsharpy.com), the AI to-do list for Mac. Claude Code, Codex, Cursor, Claude and the ChatGPT desktop app read your to-do list, suggest tasks for it and mark them done. They can also search what you worked on and your calls.

Not to be confused with Sharphy (a .NET diagnostics MCP server) or with the `sharpy-mcp` of the sharpy.live video editor. This is the server of Sharpy, the AI to-do list for Mac at getsharpy.com.

This repository holds the setup docs and example configs. The server itself ships inside the Sharpy app, so there is nothing here to build or install.

- Runs on your Mac, over stdio. Nothing to host.
- Helper: `/Applications/Sharpy.app/Contents/Helpers/sharpy-mcp`, no arguments.
- Sharpy has to be running. When it isn't, the server offers only `sharpy_status`.
- Docs: [getsharpy.com/mcp](https://getsharpy.com/mcp)

## Requirements

- [Sharpy for Mac](https://getsharpy.com/download?ref=github). Free in early access.
- macOS 14 or later, Apple silicon.

## Setup

### Automatic

Sharpy connects itself to the AI tools it finds on your Mac, at first launch and again when you install a new one. It writes one entry called `sharpy` into each tool's own config file and leaves everything else in that file as it was. The first time it edits a file it keeps a copy beside it, named `<file>.sharpy-backup`.

It knows these tools: Claude Code, Claude, ChatGPT & Codex, Cursor, VS Code, Windsurf, Gemini CLI, Antigravity, Zed, OpenCode and LM Studio. The list is in Sharpy under Settings → Connections → AI tools, with Connect and Remove on each row. Remove is permanent: Sharpy won't add itself back unless you press Connect.

### By hand

**Claude Code**

```sh
claude mcp add sharpy -- /Applications/Sharpy.app/Contents/Helpers/sharpy-mcp
```

**Claude, Cursor, Windsurf, Gemini CLI, LM Studio and anything else that takes `mcpServers`**: [`examples/mcpServers.json`](examples/mcpServers.json)

```json
{
  "mcpServers": {
    "sharpy": {
      "command": "/Applications/Sharpy.app/Contents/Helpers/sharpy-mcp"
    }
  }
}
```

| Tool | File |
|---|---|
| Claude | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Cursor | `~/.cursor/mcp.json` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` |
| Gemini CLI | `~/.gemini/settings.json` |
| LM Studio | `~/.lmstudio/mcp.json` |

**Codex and the ChatGPT desktop app** (both read `~/.codex/config.toml`): [`examples/codex-config.toml`](examples/codex-config.toml)

```toml
[mcp_servers.sharpy]
command = "/Applications/Sharpy.app/Contents/Helpers/sharpy-mcp"
```

**VS Code** (`~/Library/Application Support/Code/User/mcp.json`): [`examples/vscode-mcp.json`](examples/vscode-mcp.json)

```json
{
  "servers": {
    "sharpy": {
      "type": "stdio",
      "command": "/Applications/Sharpy.app/Contents/Helpers/sharpy-mcp"
    }
  }
}
```

Every one of these tools reads its settings at start, so restart it after the change.

### Over HTTP

For a tool that can't launch a process, Sharpy also listens on `http://127.0.0.1:8787`, on this Mac only. Requests need `Authorization: Bearer <token>`. The token is created at first launch and kept beside your memory, readable only by you:

```sh
python3 -c 'import json,os;print(json.load(open(os.path.expanduser("~/Library/Application Support/Sharpy/credentials.json")))["values"]["mcp_http_token"])' | base64 -d
```

Requests that come from a web page are refused whatever token they carry.

## Tools

**Your list**

- `list_work`: what is on the list and what is next
- `add_work_item`: suggest a task (Sharpy decides where it goes on the list)
- `update_work_item`: rename a task, move it or mark it done
- `wait_for_list_change`: wait for the list to change

**What you were working on**

- `search_memory`: search what was on your screen
- `get_recent_activity`: the last few minutes
- `get_working_memory`: the last few hours
- `search_calls`, `get_call`: find a call and read its notes

**Privacy controls**

- `pause_capture`, `resume_capture`, `add_exclusion`, `list_exclusions`, `delete_memory`: the same switches as in Settings

Your version of Sharpy may offer more. Your client's tool list shows exactly what it has.

## Permissions

- A tool Sharpy set itself up in is allowed at once. Any other program asks on Sharpy's island the first time it connects. You can revoke either in Settings → Connections.
- Changing the list needs the client's control right, which turns on when you press Allow.
- In Claude Code, Sharpy allows its read tools and adds an `ask` rule for each tool that changes something (deleting memory, exclusions, pausing), so those still stop and ask you.
- Tools that write files or act in your connected apps are not offered to outside clients.

## Privacy

The server runs on your Mac and answers from the local database under `~/Library/Application Support/Sharpy/`. What an agent pulls into its context goes wherever that agent sends its context. For Claude Code that is Anthropic's API.

## Questions

**Can I use it from chatgpt.com in a browser?** No. Browser connectors run on OpenAI's servers, which can't reach your Mac. Use the ChatGPT desktop app, which reads Codex's config.

**Is this the same Sharpy as sharpy.live?** No. This Sharpy is the AI to-do list for Mac at [getsharpy.com](https://getsharpy.com), made by SharpyHQ. sharpy.live is an unrelated AI video editor with its own MCP server of the same name.

**Is this Sharphy?** No. Sharphy is a separate .NET diagnostics MCP server.

**Do Todoist and Linear tasks show up?** Connect Todoist and Linear in Sharpy, and their tasks are on the same list your agent reads.

## Links

- Website: [getsharpy.com](https://getsharpy.com)
- MCP docs: [getsharpy.com/mcp](https://getsharpy.com/mcp)
- X: [@sharpyinc](https://x.com/sharpyinc)
- Contact: hello@getsharpy.com

## License

The docs and example configs in this repository are MIT licensed. The Sharpy app is proprietary and free in early access.
