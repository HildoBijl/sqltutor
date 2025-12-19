// Capitalize the first letter of a string and lowercase the rest.
export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Capitalize the first letter of a string, keeping the rest unchanged.
export function capitalizeFirst(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

