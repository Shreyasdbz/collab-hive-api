/**
 * Takes in a map of Map<string, string> and returns an array of strings of the keys
 */
export function getMappingKeys(mapping: Map<string, string>): string[] {
    return Array.from(mapping.keys());
}
