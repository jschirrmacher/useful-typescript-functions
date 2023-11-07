# Functions

## `oneByOne`

Run asynchronous functions one after each other. Each of the functions get the resolved value of the previous
function as a parameter. The last result is resolved by oneByOne().

```ts
const result = await oneByOne([
  async () => readUsers(),
  async (users: User[]) => readEntries(users),
])
```
