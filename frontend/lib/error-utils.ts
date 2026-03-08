export const getApiErrorMessage = (err: unknown, fallback: string): string => {
    if (err && typeof err === "object" && "message" in err) {
        const maybeMessage = (err as { message?: unknown }).message;
        if (typeof maybeMessage === "string" && maybeMessage.trim()) {
            return maybeMessage;
        }
    }
    return fallback;
};
