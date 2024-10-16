import Benchmark from "benchmark";
import { join, pathcat } from "./src/index.ts";

const suite = new Benchmark.Suite();

suite
	.add("With a base URL", () => {
		pathcat("https://example.com", "/users/:user_id/posts/:post_id/reactions", {
			user_id: 1,
			post_id: 2,
			limit: 10,
			skip: 10,
		});
	})
	.add("With no base URL", () => {
		pathcat("/users/:user_id/posts/:post_id/reactions", {
			user_id: 1,
			post_id: 2,
			limit: 10,
			skip: 10,
		});
	})
	.add("With a base URL, and no params", () => {
		// @ts-expect-error
		pathcat("https://example.com", "/users/:user_id/posts/:post_id/reactions");
	})
	.add("Check how fast join paths is with two", () => {
		join("https://example.com", "test");
	})
	.add("Check how fast join paths is with many", () => {
		join("https://example.com", "test", "test", "test", "test", "test", "test");
	})
	.on("cycle", (event: Event) => {
		console.log(String(event.target));
	})
	.run({ async: true });
