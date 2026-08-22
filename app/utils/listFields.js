function flattenToStrings(value) {
    if (value == null || value === '') return [];
    if (Array.isArray(value)) {
        return value.flatMap(flattenToStrings);
    }
    if (typeof value === 'object') {
        return Object.values(value).flatMap(flattenToStrings);
    }
    const text = String(value).trim();
    if (!text || text.toLowerCase() === 'n/a') return [];
    if (text.startsWith('[')) {
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) return flattenToStrings(parsed);
        } catch (error) {
            // keep as a plain string
        }
    }
    return [text];
}

function normalizeList(value) {
    let items = flattenToStrings(value).filter(item => item && item.toLowerCase() !== 'n/a');
    if (items.length > 1 && items.every(item => item.length === 1)) {
        const joined = items.join('').trim();
        return joined ? [joined] : [];
    }
    return items;
}

function formatList(value) {
    const items = normalizeList(value);
    return items.length ? items.join(', ') : '';
}

module.exports = { normalizeList, formatList };
