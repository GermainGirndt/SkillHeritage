import env from "@/config/dotenv";

import ITutorialApiClient from "@/src/interfaces/ITutorialApiClient";
import DummyTutorialApiClient from "./DummyTutorialApiClient";
import BackendTutorialApiClient from "./BackendTutorialApiClient";

const DefaultTutorialsApiClient: ITutorialApiClient = env.USE_DUMMY_API_CLIENT
  ? new DummyTutorialApiClient()
  : new BackendTutorialApiClient();

console.log(
  `Using ${DefaultTutorialsApiClient.constructor.name} as DefaultTutorialsApiClient`,
);

export { DefaultTutorialsApiClient };

export default DefaultTutorialsApiClient;
