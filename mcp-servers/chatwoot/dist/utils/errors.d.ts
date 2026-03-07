export declare function formatError(e: unknown): {
    content: {
        type: "text";
        text: string;
    }[];
    isError: true;
};
export declare function ok(result: unknown): {
    content: {
        type: "text";
        text: string;
    }[];
};
