#!/usr/bin/env node

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const port = Number(process.env.CODEX_BRIDGE_PORT ?? 20128);
const upstreamBaseUrl =
	process.env.OPENCODE_GO_BASE_URL ?? "https://opencode.ai/zen/go/v1";
const defaultModel = process.env.OPENCODE_GO_MODEL ?? "glm-5.1";

async function readConfigToken() {
	if (process.env.OPENCODE_GO_API_KEY) return process.env.OPENCODE_GO_API_KEY;

	const configPath =
		process.env.CODEX_CONFIG ?? `${process.env.HOME}/.codex/config.toml`;
	const config = await readFile(configPath, "utf8").catch(() => "");
	const block = config.match(
		/\[model_providers\.opencodego\]([\s\S]*?)(?:\n\[|$)/,
	)?.[1];
	return block?.match(/experimental_bearer_token\s*=\s*"([^"]+)"/)?.[1];
}

function json(res, status, body) {
	const payload = JSON.stringify(body);
	res.writeHead(status, {
		"access-control-allow-origin": "*",
		"content-length": Buffer.byteLength(payload),
		"content-type": "application/json",
	});
	res.end(payload);
}

let sequenceNumber = 0;

function sse(res, event, data) {
	res.write(`event: ${event}\n`);
	res.write(
		`data: ${JSON.stringify({ type: event, sequence_number: sequenceNumber++, ...data })}\n\n`,
	);
}

async function readBody(req) {
	const chunks = [];
	for await (const chunk of req) chunks.push(chunk);
	if (chunks.length === 0) return {};
	return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function textFromContent(content) {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	return content
		.map((part) => {
			if (typeof part === "string") return part;
			return part.text ?? part.input_text ?? part.output_text ?? "";
		})
		.filter(Boolean)
		.join("\n");
}

function responseInputToMessages(body) {
	const messages = [];
	if (body.instructions) {
		messages.push({ role: "system", content: body.instructions });
	}

	if (typeof body.input === "string") {
		messages.push({ role: "user", content: body.input });
		return messages;
	}

	for (const item of body.input ?? []) {
		if (item.type === "message") {
			messages.push({
				role: item.role === "assistant" ? "assistant" : "user",
				content: textFromContent(item.content),
			});
			continue;
		}

		if (item.type === "function_call_output") {
			messages.push({
				role: "tool",
				tool_call_id: item.call_id,
				content:
					typeof item.output === "string"
						? item.output
						: JSON.stringify(item.output ?? ""),
			});
		}
	}

	return messages.length > 0 ? messages : [{ role: "user", content: "" }];
}

function catalogModel(id) {
	return {
		slug: id,
		display_name: id,
		description: "Routed through local Responses-to-Chat bridge.",
		default_reasoning_level: "medium",
		supported_reasoning_levels: [
			{ effort: "low", description: "Lighter reasoning" },
			{ effort: "medium", description: "Default reasoning" },
			{ effort: "high", description: "More reasoning" },
		],
		shell_type: "shell_command",
		visibility: "list",
		supported_in_api: true,
		priority: 100,
		additional_speed_tiers: [],
		service_tiers: [],
		availability_nux: { message: "" },
		upgrade: null,
		base_instructions: "",
		supports_reasoning_summaries: false,
		default_reasoning_summary: "none",
		support_verbosity: false,
		default_verbosity: "medium",
		apply_patch_tool_type: "freeform",
		web_search_tool_type: "text_and_image",
		truncation_policy: { mode: "tokens", limit: 10000 },
		supports_parallel_tool_calls: false,
		supports_image_detail_original: false,
		context_window: 128000,
		max_context_window: 128000,
		effective_context_window_percent: 95,
		experimental_supported_tools: [],
		input_modalities: ["text"],
		supports_search_tool: false,
	};
}

async function handleModels(req, res, token) {
	const upstream = await fetch(`${upstreamBaseUrl}/models`, {
		headers: { authorization: `Bearer ${token}` },
	}).catch((error) => ({ error }));

	if (upstream.error) {
		json(res, 502, { error: String(upstream.error) });
		return;
	}

	const body = await upstream.json().catch(() => ({}));
	const ids = Array.isArray(body.data)
		? body.data.map((model) => model.id).filter(Boolean)
		: [defaultModel];

	if (new URL(req.url, "http://localhost").searchParams.get("openai") === "1") {
		json(res, 200, { object: "list", data: ids.map((id) => ({ id, object: "model" })) });
		return;
	}

	json(res, 200, { models: ids.map(catalogModel) });
}

async function handleResponses(req, res, token) {
	const body = await readBody(req);
	const responseId = `resp_${Date.now().toString(36)}`;
	const itemId = `msg_${Date.now().toString(36)}`;
	const contentId = `ct_${Date.now().toString(36)}`;
	const model = body.model ?? defaultModel;

	const upstreamBody = {
		model,
		messages: responseInputToMessages(body),
		stream: true,
		temperature: body.temperature,
		top_p: body.top_p,
		max_tokens: body.max_output_tokens,
	};

	res.writeHead(200, {
		"access-control-allow-origin": "*",
		"cache-control": "no-cache, no-transform",
		connection: "keep-alive",
		"content-type": "text/event-stream; charset=utf-8",
		"x-accel-buffering": "no",
	});

	sse(res, "response.created", {
		response: { id: responseId, object: "response", status: "in_progress", model },
	});
	sse(res, "response.output_item.added", {
		response_id: responseId,
		output_index: 0,
		item: { id: itemId, type: "message", status: "in_progress", role: "assistant" },
	});
	sse(res, "response.content_part.added", {
		response_id: responseId,
		item_id: itemId,
		output_index: 0,
		content_index: 0,
		part: { type: "output_text", text: "" },
	});

	const upstream = await fetch(`${upstreamBaseUrl}/chat/completions`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${token}`,
			"content-type": "application/json",
		},
		body: JSON.stringify(upstreamBody),
	}).catch((error) => ({ error }));

	if (upstream.error || !upstream.ok || !upstream.body) {
		const detail = upstream.error
			? String(upstream.error)
			: await upstream.text().catch(() => upstream.statusText);
		sse(res, "response.failed", {
			response: {
				id: responseId,
				object: "response",
				status: "failed",
				error: { message: detail },
			},
		});
		res.end();
		return;
	}

	let text = "";
	let buffer = "";
	const decoder = new TextDecoder();

	for await (const chunk of upstream.body) {
		buffer += decoder.decode(chunk, { stream: true });
		const lines = buffer.split("\n");
		buffer = lines.pop() ?? "";

		for (const line of lines) {
			if (!line.startsWith("data:")) continue;
			const data = line.slice(5).trim();
			if (!data || data === "[DONE]") continue;

			const parsed = JSON.parse(data);
			const delta = parsed.choices?.[0]?.delta?.content ?? "";
			if (!delta) continue;

			text += delta;
			sse(res, "response.output_text.delta", {
				response_id: responseId,
				item_id: itemId,
				output_index: 0,
				content_index: 0,
				delta,
			});
		}
	}

	sse(res, "response.output_text.done", {
		response_id: responseId,
		item_id: itemId,
		output_index: 0,
		content_index: 0,
		text,
	});
	sse(res, "response.content_part.done", {
		response_id: responseId,
		item_id: itemId,
		output_index: 0,
		content_index: 0,
		part: { type: "output_text", text },
	});
	sse(res, "response.output_item.done", {
		response_id: responseId,
		output_index: 0,
		item: {
			id: itemId,
			type: "message",
			status: "completed",
			role: "assistant",
			content: [{ type: "output_text", text, annotations: [] }],
		},
	});
	sse(res, "response.completed", {
		response: {
			id: responseId,
			object: "response",
			status: "completed",
			model,
			output: [
				{
					id: itemId,
					type: "message",
					status: "completed",
					role: "assistant",
					content: [{ id: contentId, type: "output_text", text, annotations: [] }],
				},
			],
			usage: null,
		},
	});
	res.end();
}

const token = await readConfigToken();
if (!token) {
	console.error("Missing OPENCODE_GO_API_KEY or opencodego token in Codex config.");
	process.exit(1);
}

createServer(async (req, res) => {
	try {
		if (req.method === "OPTIONS") {
			res.writeHead(204, {
				"access-control-allow-headers": "authorization, content-type",
				"access-control-allow-methods": "GET, POST, OPTIONS",
				"access-control-allow-origin": "*",
			});
			res.end();
			return;
		}

		const path = new URL(req.url, "http://localhost").pathname;
		if (req.method === "GET" && path.endsWith("/models")) {
			await handleModels(req, res, token);
			return;
		}
		if (req.method === "POST" && path.endsWith("/responses")) {
			await handleResponses(req, res, token);
			return;
		}

		json(res, 404, { error: `No route for ${req.method} ${path}` });
	} catch (error) {
		json(res, 500, { error: String(error?.stack ?? error) });
	}
}).listen(port, "127.0.0.1", () => {
	console.log(`Codex Responses bridge listening at http://127.0.0.1:${port}/v1`);
});
