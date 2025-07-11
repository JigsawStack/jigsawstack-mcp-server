import { JigsawStack } from "jigsawstack";
import dotenv from "dotenv";

dotenv.config();

const JIGSAWSTACK_API_KEY = process.env.JIGSAWSTACK_API_KEY;

// if (!JIGSAWSTACK_API_KEY) {
//   throw new Error("JIGSAWSTACK_API_KEY environment variable is required");
// }

const jigsawStackClient = JigsawStack({
  apiKey: JIGSAWSTACK_API_KEY,
});

export default jigsawStackClient;