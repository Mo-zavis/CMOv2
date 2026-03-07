export declare function formatError(error: unknown): {
    content: Array<{
        type: 'text';
        text: string;
    }>;
    isError: true;
};
