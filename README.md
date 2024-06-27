# `pathcat` 🐾

Simply path/URL building in JavaScript. Intelligently handles URL params and query strings.

This library owes thanks to urlcat, but unfortunately it seems to be abandoned. You can mostly use pathcat as a replacement.

## Features

- Very intuitive API
- Supports URL params and query string
- Avoids double slashes

## Install

```sh
yarn add pathcat
```

## Usage

```typescript
import { pathcat } from "pathcat";

pathcat("https://example.com", "/:id", {
	id: 123,
});
// => 'https://example.com/123'

pathcat("https://example.com", "/:id", {
	id: "123",
	foo: "bar",
});
// => 'https://example.com/123?foo=bar'

// Base URL is optional, works on just paths as well.
pathcat("/users/:user_id/posts/:post_id", {
	user_id: "123",
	post_id: 456,
	cool_flag: true,
});
// => '/users/123/posts/456?cool_flag=true'

// You can also use arrays for query string values
pathcat("/users/:user_id/posts/:post_id", {
	user_id: "123",
	post_id: 456,
	cool_flag: true,
	fields: ["title", "body"],
});
// => '/users/123/posts/456?cool_flag=true&fields=title&fields=body'
```

## Benchmark:

Results when running `bun run benchmark.ts` on an M3 Max

```
pathcat x 1,132,795 ops/sec ±0.74% (95 runs sampled)
```

## Notes:

- Any params or query string values that are `undefined` will be omitted.
- Params that were not specified in the object will be left as is.
