import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeStatus } from "../src/app/api/self-paced-progress/route";

test("lecture status becomes completed only at 92% watched", () => {
  assert.equal(normalizeStatus("inprogress", 91), "inprogress");
  assert.equal(normalizeStatus("inprogress", 92), "completed");
  assert.equal(normalizeStatus(undefined, 92), "completed");
  assert.equal(normalizeStatus("completed", 50), "completed");
});
