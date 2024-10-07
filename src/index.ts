/**
 * Represents a parameter value that can be used in a URL path.
 */
export type ParamValue = string | number | boolean | null | undefined;

/**
 * Represents a parameter value that can be used in a URL query.
 * This can be either a single value or an array of values.
 */
export type QueryValue = ParamValue | ParamValue[];

/**
 * Drops the protocol from the start of a url string
 */
export type DropProtocol<T extends string> = T extends `${infer _Protocol extends
	| "http"
	| "https"}://${infer Rest}`
	? Rest
	: T;

/**
 * Extracts url parameters from a route template string
 */
export type ExtractRouteParams<T extends string> = string extends T
	? string
	: T extends `${string}:${infer Param}/${infer Rest}`
	? Param | ExtractRouteParams<Rest>
	: T extends `${string}:${infer Param}`
	? Param
	: never;

/**
 * Represents a query object, where each key is a parameter name and each value is a parameter value.
 * If the template has URL params (like `/users/:user_id/posts`), the query object must contain at least the user_id param
 */
export type Query<Template extends string> = Record<ExtractRouteParams<Template>, ParamValue> &
	Record<string, QueryValue>;

// Defined early so we don't need to reallocate.
// this is probably a minimal optimization
const slash = "/";
const qmark = "?";
const eq = "=";
const amp = "&";
const emptyobj = {};
const colon = ":";

/**
 * Joins two paths together, removing up to 1 duplicate slashe between them
 * @param a The first path to join
 * @param b The second path to join
 * @returns The joined path
 *
 * @example
 * ```ts
 * join("a", "b"); // "a/b"
 * join("a/", "/b"); // "a/b"
 * join("a", "/b"); // "a/b"
 * join("a/", "//b"); // "a//b"
 * join("a", "//b"); // "a//b"
 * ```
 */
export function join(a: string, b: string): string {
	const aEndsWithSlash = a.endsWith(slash);
	const bStartsWithSlash = b.startsWith(slash);

	if (aEndsWithSlash && bStartsWithSlash) {
		return a + b.slice(1);
	}

	if (!aEndsWithSlash && !bStartsWithSlash) {
		return a.concat(slash, b);
	}

	return a.concat(b);
}

/**
 * Checks if a path template has parameters. Used to determine the order of arguments in `pathcat()`.
 */
export type DoesPathHaveParams<Path extends string> = string extends Path
	? false
	: ExtractRouteParams<DropProtocol<Path>> extends never
	? false
	: true;

/**
 * Joins a path template with a query object, returning a path with the query appended and parameters replaced.
 * @param template The path template to join with the query
 * @param base The base URL to join with the path
 * @param query The query to append to the path
 */
export function pathcat<Path extends string>(
	// prettier-ignore
	...args: DoesPathHaveParams<Path> extends false
		?
				| [base: string, path: Path | Query<DropProtocol<Path>>]
				| [base: string, path: Path, query: Query<Path>]
		:
				| [path: Path, query: Query<DropProtocol<Path>>]
				| [base: string, path: Path, query: Query<DropProtocol<Path>>]
): string;

export function pathcat(base: string, path?: string | Query<string>, query?: Query<string>) {
	return pathcatInternal(
		typeof path === "string" ? join(base, path) : base,
		typeof path === "object" ? path : query ?? emptyobj
	);
}

function paramValueToString(value: Exclude<ParamValue, undefined>) {
	return value === null ? "null" : String(value);
}

function pathcatInternal(template: string, params: Query<string>) {
	const entries = Object.entries(params);
	let path = template;
	let qs = "";

	for (let i = 0; i < entries.length; i++) {
		const [key, value] = entries[i] as [string, QueryValue];

		if (value === undefined) {
			continue;
		}

		const withColon = colon.concat(key);
		if (path.includes(withColon)) {
			if (Array.isArray(value)) {
				return colon.concat(key);
			}

			path = path.replace(`:${key}`, paramValueToString(value));

			continue;
		}

		if (Array.isArray(value)) {
			for (let j = 0; j < value.length; j++) {
				const item = value[j];

				if (item !== undefined) {
					qs += key.concat(eq, paramValueToString(item), amp);
				}
			}
		} else {
			qs += key.concat(eq, paramValueToString(value), amp);
		}
	}

	if (qs.length) {
		return path.concat(qmark.concat(qs).slice(0, qs.length));
	}

	return path;
}
