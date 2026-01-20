import assert from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OpenAPIParser} from "../src/openapi-parser.js";

describe("OpenAPI parsing", () => {
  // const __filename = fileURLToPath(import.meta.url);
  // const __dirname = path.dirname(__filename);
  const oasPath = path.join(__dirname, "../", "src/data/paystack.openapi.yaml");
  const openapi = new OpenAPIParser(oasPath);

  before(async () => {
    await openapi.parse();
  });

  describe("Get operation by ID", () => {
    it("should return operation name given the operation ID", () => {
      const op = openapi.getOperationById("transaction_partialDebit");
      assert.equal("Partial Debit", op?.name);
    });
  })
});