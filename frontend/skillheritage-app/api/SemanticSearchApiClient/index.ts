import env from "@/config/dotenv";
import ITutorialsSemanticSearchAPIClient from "@/interfaces/ITutorialsSemanticSearchAPIClient";
import DummyTutorialsSemanticSearchAPIClient from "./DummyTutorialsSemanticSearchAPIClient";
import BackendSemanticSearchAPIClient from "./BackendSemanticSearchAPIClient";

const DefaultTutorialSemanticSearchAPIClient: ITutorialsSemanticSearchAPIClient =
  env.USE_DUMMY_API_CLIENT
    ? new DummyTutorialsSemanticSearchAPIClient()
    : new BackendSemanticSearchAPIClient();

console.log(
  `Using ${DefaultTutorialSemanticSearchAPIClient.constructor.name} as DefaultTutorialSemanticSearchAPIClient`,
);

export default DefaultTutorialSemanticSearchAPIClient;
