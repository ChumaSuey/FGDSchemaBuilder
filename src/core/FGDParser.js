/**
 * Note: For this to work in a browser environment, you will need a polyfill
 * for `crypto.randomUUID`. Modern browsers support it, but for broader
 * compatibility, a library like `uuid` could be used.
 * For this example, we assume a modern environment where it's available.
 */

/**
 * Parses the base(...) definitions for an entity.
 * @param {string} baseStr The string containing base class definitions.
 * @param {string} headerStr The string containing all header definitions.
 * @returns {string[]} An array of base class names.
 */
function parseBaseClasses(headerStr) {
    if (!headerStr) return [];
    const baseClassRegex = /base\(([^)]+)\)/g;
    const bases = [];
    let match;
    while ((match = baseClassRegex.exec(headerStr)) !== null) {
        const classList = match[1].split(',').map(s => s.trim()).filter(Boolean);
        bases.push(...classList);
    }
    return bases;
}

/**
 * Parses various helper properties from an entity's header.
 * @param {string} headerStr The string containing all header definitions.
 * @returns {object} An object containing parsed helper data.
 */
function parseHelpers(headerStr) {
    if (!headerStr) return {};
    const helpers = {};
    // Simple key-value helpers like size() and color()
    const simpleHelperRegex = /(size|color)\s*\(([^)]+)\)/g;
    let match;
    while ((match = simpleHelperRegex.exec(headerStr)) !== null) {
        helpers[match[1]] = match[2].trim();
    }
    // Complex model helper that can contain nested structures
    const modelMatch = headerStr.match(/model\s*\(([\s\S]*)\)/);
    if (modelMatch) {
        helpers.model = modelMatch[1].trim();
    }
    return helpers;
}

/**
 * Parses the spawnflags block.
 * @param {string} flagsLine The full line containing the spawnflags definition.
 * @returns {object[]} An array of flag option objects.
 */
function parseFlags(flagsLine) {
    const options = [];
    const blockContentMatch = flagsLine.match(/\[([\s\S]*)\]/);
    if (!blockContentMatch) return [];

    const content = blockContentMatch[1];
    // Regex to find: 123 : "My Flag" : 0 or 1
    const flagRegex = /(\d+)\s*:\s*"([^"]+)"\s*:\s*(\d)/g;
    let match;
    while ((match = flagRegex.exec(content)) !== null) {
        const [, value, label, isDefault] = match;
        options.push({
            value: parseInt(value, 10),
            label: label,
            default: !!parseInt(isDefault, 10),
        });
    }
    return options;
}

/**
 * Parses the choices block.
 * @param {string} choiceBlock The string content of the choices block.
 * @returns {object[]} An array of choice option objects.
 */
function parseChoices(choiceBlock) {
    const options = [];
    // Regex to find: 0 : "Medieval"
    const choiceRegex = /(-?\d+)\s*:\s*"([^"]+)"/g;
    let match;
    while ((match = choiceRegex.exec(choiceBlock)) !== null) {
        const [, value, label] = match;
        options.push({
            value: parseInt(value, 10),
            label: label,
        });
    }
    return options;
}


/**
 * Parses the body of an entity definition to extract its properties.
 * @param {string} bodyText The text content between the `[` and `]` of an entity.
 * @returns {object[]} An array of property objects.
 */
function parseEntityBody(bodyText) {
    const properties = [];
    // Split by newline, then filter out empty or comment-only lines
    const lines = bodyText.trim().split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//'));

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Check for block properties like `spawnflags` or `choices`
        const isBlockProp = line.includes('=') && (line.includes('(flags)') || line.includes('(choices)'));

        if (isBlockProp) {
            let blockContent = '';
            // Consume lines until we find the closing bracket
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].includes(']')) {
                    blockContent += lines[j].substring(0, lines[j].indexOf(']'));
                    i = j; // Move the outer loop index forward
                    break;
                }
                blockContent += lines[j] + '\n';
            }

            const propRegex = /(\w+)\s*\((\w+)\)\s*(?::\s*"([^"]*)")?\s*(?::\s*(-?[\d.\s]+|"[^"]*"))?/;
            const propMatch = line.match(propRegex);
            if (!propMatch) continue;

            const [, name, type, displayName, defaultValue] = propMatch;
            const isFlags = type.toLowerCase() === 'flags';

            properties.push({
                id: crypto.randomUUID(),
                name: name || '',
                type: type || 'string',
                displayName: displayName || name,
                defaultValue: defaultValue ? defaultValue.replace(/"/g, '').trim() : '',
                description: '', // Block props don't have a trailing description
                options: isFlags ? parseFlags(`[${blockContent}]`) : parseChoices(blockContent),
            });

        } else {
            // Handle standard, single-line properties
            // Regex for standard properties: name(type) : "Display Name" : "Default Value" : "Description"
            // Parts are optional, so we use non-capturing groups `(?:...)` and make them optional `?`.
            const propRegex = /(\w+)\s*\((\w+)\)\s*(?::\s*"([^"]*)")?\s*(?::\s*(-?[\d.\s]+|"[^"]*"))?\s*(?::\s*"([^"]*)")?/;
            const propMatch = line.match(propRegex);

            if (propMatch) {
                const [, name, type, displayName, defaultValue, description] = propMatch;
                properties.push({
                    id: crypto.randomUUID(),
                    name: name || '',
                    type: type || 'string',
                    displayName: displayName || name, // Default to name if no display name
                    // Clean up default value (remove quotes)
                    defaultValue: defaultValue ? defaultValue.replace(/"/g, '').trim() : '',
                    description: description || '',
                });
            }
        }
    }
    return properties;
}

/**
 * Parses a raw FGD file string into a structured JSON object.
 * @param {string} fgdText The raw text content of an FGD file. This should be the full file content.
 * @returns {object} A structured JSON representation of the FGD data.
 */
export function parseFGD(fgdText) {
    const schema = {
        metadata: {
            mapsize: null,
            includes: [],
        },
        entities: [],
    };

    // 1. Pre-processing: Remove C-style comments and normalize line endings
    const cleanText = fgdText
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Remove multi-line and single-line comments
        .replace(/\r\n/g, '\n') // Normalize line endings
        .trim();

    // 2. Parse top-level directives
    const mapsizeMatch = cleanText.match(/@mapsize\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/);
    if (mapsizeMatch) {
        schema.metadata.mapsize = {
            min: parseInt(mapsizeMatch[1], 10),
            max: parseInt(mapsizeMatch[2], 10),
        };
    }

    const includeMatches = [...cleanText.matchAll(/@include\s*"([^"]+)"/g)];
    schema.metadata.includes = includeMatches.map(match => match[1]);

    // 3. Parse entity blocks
    // This regex is the core of the parser. It's designed to be flexible.
    // It captures the class type, all the header content before the '=', the name, description, and body.
    const entityRegex = /@(\w+)\s*([\s\S]*?)\s*=\s*(\w+)\s*(?::\s*"([^"]*)")?\s*(?:\[([\s\S]*?)\])?/g;

    let match;
    while ((match = entityRegex.exec(cleanText)) !== null) {
        // We need to ensure we don't re-process text inside a matched block
        if (match.index > entityRegex.lastIndex) {
             entityRegex.lastIndex = match.index;
        }

        const [, classType, header, name, description, body] = match;

        const entity = {
            id: crypto.randomUUID(),
            classType: classType || '',
            name: name || '',
            description: (description || '').trim(),
            baseClasses: parseBaseClasses(header || ''),
            helpers: parseHelpers(header || ''),
            properties: body ? parseEntityBody(body) : [],
        };

        schema.entities.push(entity);
    }
    return schema;
}