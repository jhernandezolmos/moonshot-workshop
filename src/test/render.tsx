import { render } from "@testing-library/react";
import { App } from "../App";
import { StateProvider } from "../state";

export function renderApp({ reducedMotion = false } = {}) {
  return render(
    <StateProvider prefersReducedMotion={reducedMotion}>
      <App />
    </StateProvider>,
  );
}
