const { normalizeList } = require('./listFields');

const LIST_FIELDS = ['school', 'major', 'currentPosition', 'company', 'location', 'interests', 'extracurriculars'];

function parseArrayField(value) {
    if (value == null || value === '') return [];
    if (Array.isArray(value)) return normalizeList(value);
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed || trimmed.toLowerCase() === 'n/a') return [];
        if (trimmed.startsWith('[')) {
            try {
                return normalizeList(JSON.parse(trimmed));
            } catch (error) {
                return normalizeList(trimmed);
            }
        }
        return normalizeList(trimmed);
    }
    return normalizeList(value);
}

function emptySocial(value) {
    const text = value == null ? '' : String(value).trim();
    return !text || text.toLowerCase() === 'n/a';
}

function withProtocol(value) {
    const text = String(value).trim();
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(text)) return text;
    return `https://${text}`;
}

function isHttpUrl(value) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (error) {
        return false;
    }
}

function hostMatches(value, hosts) {
    const host = new URL(value).hostname.replace(/^www\./, '').toLowerCase();
    return hosts.some(allowed => host === allowed || host.endsWith(`.${allowed}`));
}

function validateSocialLink(label, value, hosts) {
    if (emptySocial(value)) return { ok: true, stored: 'n/a' };
    const url = withProtocol(value);
    if (!isHttpUrl(url) || (hosts && hosts.length && !hostMatches(url, hosts))) {
        return { ok: false, message: `Could not save details. The ${label} link is not valid.` };
    }
    return { ok: true, stored: url };
}

function validateDiscord(value) {
    if (emptySocial(value)) return { ok: true, stored: 'n/a' };
    const text = String(value).trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    if (/discord\.(gg|com|app)/i.test(text) || text.includes('/')) {
        return { ok: false, message: 'Could not save details. Enter a Discord username, not a link.' };
    }
    if (!/^[a-zA-Z0-9._]{2,32}(#\d{4})?$/.test(text)) {
        return { ok: false, message: 'Could not save details. The Discord username is not valid.' };
    }
    return { ok: true, stored: text };
}

function normalizeDiscordUsername(value) {
    const text = String(value || '').trim();
    if (!text || text.toLowerCase() === 'n/a') return '';
    return text.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
}

module.exports = {
    LIST_FIELDS,
    parseArrayField,
    emptySocial,
    validateSocialLink,
    validateDiscord,
    normalizeDiscordUsername
};
