/**
 * Generates the string for options within a flags block.
 * @param {object[]} options - Array of flag option objects.
 * @returns {string} The formatted string for the options.
 */
function generateFlagsOptions(options) {
    if (!options || options.length === 0) return '';
    return options
        .map(opt => `\t\t${opt.value} : "${opt.label}" : ${opt.default ? 1 : 0}`)
        .join('\n');
}

/**
 * Generates the string for options within a choices block.
 * @param {object[]} options - Array of choice option objects.
 * @returns {string} The formatted string for the options.
 */
function generateChoicesOptions(options) {
    if (!options || options.length === 0) return '';
    return options
        .map(opt => `\t\t${opt.value} : "${opt.label}"`)
        .join('\n');
}

/**
 * Generates the string for a single entity property.
 * @param {object} prop - The property object from the schema.
 * @returns {string} The formatted FGD string for the property.
 */
function generateProperty(prop) {
    const isBlockType = prop.type.toLowerCase() === 'flags' || prop.type.toLowerCase() === 'choices';

    let line = `\t${prop.name}(${prop.type})`;

    if (prop.displayName && prop.displayName !== prop.name) {
        line += ` : "${prop.displayName}"`;
    }

    if (prop.defaultValue !== undefined && prop.defaultValue !== null && String(prop.defaultValue).trim() !== '') {
        // For block types, the default value comes before the '='
        if (isBlockType) {
            line += ` : ${prop.defaultValue}`;
        } else {
            // For simple types, quote if not a known numeric-like type
            const nonQuotedTypes = ['integer', 'float', 'color255', 'vector'];
            if (nonQuotedTypes.includes(prop.type.toLowerCase())) {
                line += ` : ${prop.defaultValue}`;
            } else {
                line += ` : "${prop.defaultValue}"`;
            }
        }
    }

    if (prop.description && !isBlockType) {
        line += ` : "${prop.description}"`;
    }

    if (isBlockType) {
        line += ' =\n\t[\n';
        if (prop.type.toLowerCase() === 'flags') {
            line += generateFlagsOptions(prop.options);
        } else {
            line += generateChoicesOptions(prop.options);
        }
        line += '\n\t]';
    }

    return line;
}

/**
 * Generates the string for a single entity.
 * @param {object} entity - The entity object from the schema.
 * @returns {string} The formatted FGD string for the entity.
 */
function generateEntity(entity) {
    let headerParts = [`@${entity.classType}`];

    if (entity.helpers) {
        for (const [key, value] of Object.entries(entity.helpers)) {
            if (key === 'model' && (value.includes('{') || value.includes('\n'))) {
                const indentedValue = value.trim().split('\n').map(l => `    ${l.trim()}`).join('\n');
                headerParts.push(`model(\n${indentedValue}\n)`);
            } else {
                headerParts.push(`${key}(${value})`);
            }
        }
    }

    if (entity.baseClasses && entity.baseClasses.length > 0) {
        headerParts.push(`base(${entity.baseClasses.join(', ')})`);
    }

    let header = headerParts.join(' ') + ` = ${entity.name}`;

    if (entity.description) {
        header += ` : "${entity.description}"`;
    }

    if (!entity.properties || entity.properties.length === 0) {
        return header;
    }

    const body = entity.properties.map(generateProperty).join('\n');

    return `${header} [\n${body}\n]`;
}

/**
 * Generates a valid FGD file string from a structured JSON schema.
 * @param {object} schema - The structured JSON representation of the FGD data.
 * @returns {string} A formatted FGD file string.
 */
export function generateFGD(schema) {
    if (!schema) return '// No schema provided.';

    let output = [];

    // 0. Output global comments if present
    if (schema.comments && Array.isArray(schema.comments)) {
        output.push(...schema.comments.map(comment => `// ${comment}`));
    }

    // 1. Generate Metadata
    if (schema.metadata) {
        if (schema.metadata.mapsize) {
            output.push(`@mapsize(${schema.metadata.mapsize.min}, ${schema.metadata.mapsize.max})`);
        }
        if (schema.metadata.includes && schema.metadata.includes.length > 0) {
            output.push(...schema.metadata.includes.map(inc => `@include "${inc}"`));
        }
    }

    // 2. Generate Entities
    if (schema.entities && schema.entities.length > 0) {
        output.push(...schema.entities.map(entity => {
            // Output entity comments if present
            let entityBlock = [];
            if (entity.comments && Array.isArray(entity.comments)) {
                entityBlock.push(...entity.comments.map(comment => `// ${comment}`));
            }
            entityBlock.push(generateEntity(entity));
            return entityBlock.join('\n');
        }));
    }

    // Join all parts with double newlines for spacing between top-level definitions
    return output.join('\n\n');
}

