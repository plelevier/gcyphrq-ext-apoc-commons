# gcyphrq-ext-apoc-commons

Common APOC utility functions for [gcyphrq](https://github.com/plelevier/gcyphrq).

Provides text, collection, map, math, and date utility functions mirroring the most-used functions from Neo4j's [APOC](https://github.com/neo4j/apoc) library.

## Install

```bash
npm install gcyphrq-ext-apoc-commons
```

## Usage

### CLI

```bash
gcyphrq -g graph.json --ext-fn apoc-commons \
  -e 'RETURN apoc.text.join(", ", ["a", "b", "c"]) AS joined'

# Multiple extensions can be combined
gcyphrq -g graph.json --ext-fn apoc-commons --ext-fn apoc-crypto \
  -e 'RETURN apoc.text.capitalize("hello") AS greeting'
```

### Library

```ts
import { registerFunctionExtension, executeQuery } from 'gcyphrq';

await registerFunctionExtension('apoc-commons');

const results = await executeQuery(graphData, 'RETURN apoc.text.capitalize("hello")');
```

## Available Functions

### text.*

| Function | Description | Example |
|----------|-------------|---------|
| `apoc.text.join(sep, values...)` | Join values with separator | `apoc.text.join(", ", "a", "b")` → `"a, b"` |
| `apoc.text.capitalize(str)` | Capitalize first letter | `apoc.text.capitalize("hello")` → `"Hello"` |
| `apoc.text.replaceAll(str, pattern, replacement)` | Replace all occurrences | `apoc.text.replaceAll("hello", "l", "r")` → `"herro"` |
| `apoc.text.substring(str, start[, end])` | Extract substring | `apoc.text.substring("hello", 0, 3)` → `"hel"` |
| `apoc.text.defaultIfBlank(str, fallback)` | Return fallback if blank | `apoc.text.defaultIfBlank(" ", "hi")` → `"hi"` |
| `apoc.text.split(str, delimiter)` | Split string into list | `apoc.text.split("a,b,c", ",")` → `["a","b","c"]` |
| `apoc.text.repeat(str, count)` | Repeat string n times | `apoc.text.repeat("ab", 3)` → `"ababab"` |
| `apoc.text.toLowerCase(str)` | Convert to lowercase | `apoc.text.toLowerCase("HELLO")` → `"hello"` |
| `apoc.text.toUpperCase(str)` | Convert to uppercase | `apoc.text.toUpperCase("hello")` → `"HELLO"` |
| `apoc.text.trim(str)` | Remove leading/trailing whitespace | `apoc.text.trim("  hi  ")` → `"hi"` |

### coll.*

| Function | Description | Example |
|----------|-------------|---------|
| `apoc.coll.sort(list)` | Sort a list | `apoc.coll.sort([3,1,2])` → `[1,2,3]` |
| `apoc.coll.reverse(list)` | Reverse a list | `apoc.coll.reverse([1,2,3])` → `[3,2,1]` |
| `apoc.coll.distinct(list)` | Remove duplicates | `apoc.coll.distinct([1,2,1])` → `[1,2]` |
| `apoc.coll.flatten(list)` | Flatten nested arrays | `apoc.coll.flatten([[1],[2,3]])` → `[1,2,3]` |
| `apoc.coll.zip(list1, list2, ...)` | Combine lists element-wise | `apoc.coll.zip([1,2], ["a","b"])` → `[[1,"a"],[2,"b"]]` |
| `apoc.coll.union(list1, list2)` | Union of lists | `apoc.coll.union([1,2],[2,3])` → `[1,2,3]` |
| `apoc.coll.intersection(list1, list2)` | Intersection of lists | `apoc.coll.intersection([1,2,3],[2,3,4])` → `[2,3]` |
| `apoc.coll.disjunction(list1, list2)` | Items in exactly one list | `apoc.coll.disjunction([1,2],[2,3])` → `[1,3]` |
| `apoc.coll.size(list)` | Size of collection | `apoc.coll.size([1,2,3])` → `3` |
| `apoc.coll.min(list)` | Minimum value | `apoc.coll.min([3,1,2])` → `1` |
| `apoc.coll.max(list)` | Maximum value | `apoc.coll.max([3,1,2])` → `3` |
| `apoc.coll.sum(list)` | Sum of values | `apoc.coll.sum([1,2,3])` → `6` |
| `apoc.coll.avg(list)` | Average of values | `apoc.coll.avg([1,2,3])` → `2` |
| `apoc.coll.contains(list, item)` | Check membership | `apoc.coll.contains([1,2,3], 2)` → `true` |
| `apoc.coll.indexOf(list, item)` | Find index | `apoc.coll.indexOf([1,2,3], 2)` → `1` |
| `apoc.coll.tail(list)` | All but first | `apoc.coll.tail([1,2,3])` → `[2,3]` |
| `apoc.coll.head(list)` | First element | `apoc.coll.head([1,2,3])` → `1` |
| `apoc.coll.page(list, offset, size)` | Slice a list | `apoc.coll.page([1,2,3,4,5], 1, 3)` → `[2,3,4]` |

### map.*

| Function | Description | Example |
|----------|-------------|---------|
| `apoc.map.merge(map1, map2, ...)` | Merge maps | `apoc.map.merge({a:1}, {b:2})` → `{a:1,b:2}` |
| `apoc.map.keys(map)` | Get keys | `apoc.map.keys({a:1,b:2})` → `["a","b"]` |
| `apoc.map.values(map)` | Get values | `apoc.map.values({a:1,b:2})` → `[1,2]` |
| `apoc.map.entries(map)` | Get entries | `apoc.map.entries({a:1})` → `[["a",1]]` |
| `apoc.map.contains(map, key)` | Check key exists | `apoc.map.contains({a:1}, "a")` → `true` |
| `apoc.map.containsEntry(map, key)` | Check key with non-null value | `apoc.map.containsEntry({a:null}, "a")` → `false` |
| `apoc.map.get(map, key[, fallback])` | Get value with fallback | `apoc.map.get({a:1}, "b", "default")` → `"default"` |
| `apoc.map.put(map, key, value)` | Add/replace key-value | `apoc.map.put({a:1}, "b", 2)` → `{a:1,b:2}` |
| `apoc.map.remove(map, key)` | Remove key | `apoc.map.remove({a:1,b:2}, "a")` → `{b:2}` |

### math.*

| Function | Description | Example |
|----------|-------------|---------|
| `apoc.math.clamp(value, min, max)` | Clamp to range | `apoc.math.clamp(15, 0, 10)` → `10` |
| `apoc.math.round(value[, precision])` | Round to precision | `apoc.math.round(3.14159, 2)` → `3.14` |
| `apoc.math.random([min, max])` | Random number | `apoc.math.random(1, 10)` → `7` |
| `apoc.math.abs(value)` | Absolute value | `apoc.math.abs(-5)` → `5` |
| `apoc.math.sign(value)` | Sign of number | `apoc.math.sign(-5)` → `-1` |
| `apoc.math.floor(value)` | Floor | `apoc.math.floor(3.7)` → `3` |
| `apoc.math.ceil(value)` | Ceiling | `apoc.math.ceil(3.2)` → `4` |
| `apoc.math.pow(base, exponent)` | Power | `apoc.math.pow(2, 10)` → `1024` |
| `apoc.math.sqrt(value)` | Square root | `apoc.math.sqrt(16)` → `4` |
| `apoc.math.log(value)` | Natural logarithm | `apoc.math.log(e)` → `1` |
| `apoc.math.log10(value)` | Base-10 logarithm | `apoc.math.log10(100)` → `2` |
| `apoc.math.exp(value)` | e^x | `apoc.math.exp(1)` → `2.718...` |
| `apoc.math.min(values...)` | Minimum of values | `apoc.math.min(3, 1, 2)` → `1` |
| `apoc.math.max(values...)` | Maximum of values | `apoc.math.max(3, 1, 2)` → `3` |
| `apoc.math.e()` | Euler's number | `apoc.math.e()` → `2.718...` |
| `apoc.math.pi()` | Pi | `apoc.math.pi()` → `3.14159...` |

### date.*

| Function | Description | Example |
|----------|-------------|---------|
| `apoc.date.parse(dateString[, format])` | Parse date string | `apoc.date.parse("2024-01-15")` |
| `apoc.date.format(date, format)` | Format date | `apoc.date.format(timestamp, "yyyy-MM-dd")` → `"2024-01-15"` |
| `apoc.date.now()` | Current timestamp | `apoc.date.now()` → `1705312200000` |
| `apoc.date.toString(date)` | ISO string | `apoc.date.toString(timestamp)` → `"2024-01-15T00:00:00.000Z"` |
| `apoc.date.diff(from, to[, unit])` | Date difference | `apoc.date.diff("2024-01-01", "2024-01-08", "days")` → `7` |

Supported date diff units: `milliseconds`, `seconds`, `minutes`, `hours`, `days`, `weeks`, `months`, `years`.

### util.*

| Function | Description | Example |
|----------|-------------|---------|
| `apoc.util.isNumber(value)` | Check if number | `apoc.util.isNumber(42)` → `true` |
| `apoc.util.isString(value)` | Check if string | `apoc.util.isString("hi")` → `true` |
| `apoc.util.isBoolean(value)` | Check if boolean | `apoc.util.isBoolean(true)` → `true` |
| `apoc.util.isMap(value)` | Check if map/object | `apoc.util.isMap({a:1})` → `true` |
| `apoc.util.isList(value)` | Check if list/array | `apoc.util.isList([1,2])` → `true` |
| `apoc.util.toString(value)` | Convert to string | `apoc.util.toString(42)` → `"42"` |
| `apoc.util.toBoolean(value)` | Convert to boolean | `apoc.util.toBoolean("yes")` → `true` |
| `apoc.util.toInteger(value)` | Convert to integer | `apoc.util.toInteger("42")` → `42` |
| `apoc.util.toFloat(value)` | Convert to float | `apoc.util.toFloat("3.14")` → `3.14` |
| `apoc.util.coalesce(values...)` | First non-null value | `apoc.util.coalesce(null, "hi")` → `"hi"` |
| `apoc.util.null()` | Return null | `apoc.util.null()` → `null` |

### Aggregations

| Function | Description |
|----------|-------------|
| `apoc.aggregation.avgOrNull(values)` | Average or null if empty |
| `apoc.aggregation.collectDistinct(values)` | Collect unique values |
| `apoc.aggregation.minOrNull(values)` | Minimum or null if empty |
| `apoc.aggregation.maxOrNull(values)` | Maximum or null if empty |

## Example Queries

Five ready-to-run queries demonstrating the extension with the example graphs in [`examples/`](examples/).

### 1. Reader statistics — sort, average, and size

Uses the [`bookstore.json`](examples/bookstore.json) graph to compute per-reader reading stats: sorted book list, average rating, and total count.

```bash
gcyphrq -g examples/bookstore.json --ext-fn apoc-commons \
  -e '
    MATCH (r:Reader)-[:READ]->(b:Book)
    WITH r, collect(b.title) AS books, collect(b.rating) AS ratings
    RETURN apoc.text.capitalize(r.name) AS reader,
           apoc.coll.sort(books) AS booksRead,
           apoc.coll.avg(ratings) AS avgRating,
           apoc.coll.size(books) AS totalBooks
    ORDER BY totalBooks DESC
  '
```

**Output:**

| reader | booksRead | avgRating | totalBooks |
|--------|-----------|-----------|------------|
| Alice | ["1984", "Foundation", "Pride and Prejudice"] | 4.6 | 3 |
| Bob | ["1984", "Animal Farm", "Murder on the Orient Express"] | 4.47 | 3 |
| Charlie | ["Emma", "Murder on the Orient Express", "Pride and Prejudice"] | 4.33 | 3 |

### 2. Customer lifetime value — sum, average, and rounding

Uses the [`ecommerce.json`](examples/ecommerce.json) graph to compute each customer's lifetime spend and average order value.

```bash
gcyphrq -g examples/ecommerce.json --ext-fn apoc-commons \
  -e '
    MATCH (c:Customer)-[:PLACED]->(o:Order)
    WITH c, collect(o) AS orders, collect(o.total) AS totals
    RETURN apoc.text.capitalize(c.name) AS customer,
           apoc.coll.size(orders) AS orderCount,
           apoc.coll.sum(totals) AS lifetimeSpend,
           apoc.math.round(apoc.coll.avg(totals), 2) AS avgOrder,
           c.tier AS tier
    ORDER BY lifetimeSpend DESC
  '
```

**Output:**

| customer | orderCount | lifetimeSpend | avgOrder | tier |
|----------|-----------|---------------|----------|------|
| Alice Johnson | 2 | 2779.96 | 1389.98 | gold |
| Diana Lee | 1 | 1449.98 | 1449.98 | gold |
| Bob Smith | 2 | 728.97 | 364.49 | silver |
| Charlie Davis | 1 | 449.98 | 449.98 | bronze |

### 3. Tag cloud per book — split, uppercase, and filtering

Uses the [`bookstore.json`](examples/bookstore.json) graph to extract and display tags for highly-rated books.

```bash
gcyphrq -g examples/bookstore.json --ext-fn apoc-commons \
  -e '
    MATCH (b:Book)
    WHERE b.rating >= 4.5
    RETURN apoc.text.toUpperCase(b.title) AS title,
           apoc.text.split(b.tags, ",") AS tags,
           b.rating
    ORDER BY b.rating DESC
  '
```

**Output:**

| title | tags | rating |
|-------|------|--------|
| 1984 | ["dystopian", "classic", "political"] | 4.7 |
| FOUNDATION | ["science fiction", "space", "classic"] | 4.6 |
| PRIDE AND PREJUDICE | ["romance", "classic", "english"] | 4.5 |

### 4. Order date formatting — parse, format, and clamp

Uses the [`ecommerce.json`](examples/ecommerce.json) graph to parse ISO timestamps, format them as dates, and clamp stock levels.

```bash
gcyphrq -g examples/ecommerce.json --ext-fn apoc-commons \
  -e '
    MATCH (o:Order)-[:CONTAINS]->(p:Product)
    RETURN o.orderId AS orderId,
           apoc.date.format(apoc.date.parse(o.date), "yyyy-MM-dd") AS orderDate,
           p.name AS product,
           apoc.math.clamp(p.stock, 0, 100) AS stockLevel
    ORDER BY o.date, p.name
  '
```

**Output:**

| orderId | orderDate | product | stockLevel |
|---------|-----------|---------|------------|
| ORD-001 | 2024-01-15 | Laptop Pro | 50 |
| ORD-001 | 2024-01-15 | Wireless Mouse | 100 |
| ORD-002 | 2024-02-20 | Standing Desk | 30 |
| ORD-002 | 2024-02-20 | USB-C Hub | 100 |
| ... | ... | ... | ... |

### 5. Contact info with coalesce — type checking and fallbacks

Uses the [`bookstore.json`](examples/bookstore.json) graph to safely handle missing properties with `coalesce` and type guards.

```bash
gcyphrq -g examples/bookstore.json --ext-fn apoc-commons \
  -e '
    MATCH (r:Reader)
    RETURN apoc.text.capitalize(r.name) AS name,
           apoc.util.coalesce(r.email, "No email on file") AS contact,
           apoc.util.toBoolean(apoc.util.isString(r.email)) AS hasEmail,
           apoc.util.isMap(r) AS isNode
  '
```

**Output:**

| name | contact | hasEmail | isNode |
|------|---------|----------|--------|
| Alice | alice@reads.com | true | true |
| Bob | bob@reads.com | true | true |
| Charlie | charlie@reads.com | true | true |

## License

MIT
