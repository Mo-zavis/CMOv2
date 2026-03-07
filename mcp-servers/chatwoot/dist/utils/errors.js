export function formatError(e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { content: [{ type: 'text', text: msg }], isError: true };
}
export function ok(result) {
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
}
//# sourceMappingURL=errors.js.map