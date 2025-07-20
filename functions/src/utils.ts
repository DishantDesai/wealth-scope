export function parseCurrencyAmount(value?: string): number | undefined {
    if (!value) return undefined;
    const num = parseFloat(value.replace(/[^\d.-]/g, ""));
    return isNaN(num) ? undefined : num;
}