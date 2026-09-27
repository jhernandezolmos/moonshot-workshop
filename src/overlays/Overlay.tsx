import type { JSX } from "react";
import type { OverlayId } from "../story";
import {
  EngineOverlay,
  FragmentsOverlay,
  IntentionOverlay,
  InvitationOverlay,
  RolesOverlay,
  TensionOverlay,
} from "./chapters";
import { AutomationOverlay, ConstellationOverlay, FilesOverlay, LanguageOverlay, PrototypeOverlay } from "./prologue";
import type { OverlayProps } from "./shared";
import { CandidatesOverlay, WorkshopOverlay } from "./workshop";

const OVERLAYS: Record<OverlayId, (props: OverlayProps) => JSX.Element> = {
  files: FilesOverlay,
  automation: AutomationOverlay,
  prototype: PrototypeOverlay,
  language: LanguageOverlay,
  constellation: ConstellationOverlay,
  fragments: FragmentsOverlay,
  intention: IntentionOverlay,
  roles: RolesOverlay,
  engine: EngineOverlay,
  tension: TensionOverlay,
  workshop: WorkshopOverlay,
  candidates: CandidatesOverlay,
  invitation: InvitationOverlay,
};

export function Overlay({ id, ...props }: OverlayProps & { id: OverlayId }) {
  const Component = OVERLAYS[id];
  return <Component {...props} />;
}
