/*
 * Creates components for use by the client.
 *
 * By default it returns the components from setupNetwork.ts, those which are
 * automatically inferred from the mud.config.ts table definitions.
 *
 * However, you can add or override components here as needed. This
 * lets you add user defined components, which may or may not have
 * an onchain component.
 */

import { SetupNetworkResult } from "./setupNetwork";
import { overridableComponent } from "@latticexyz/recs";

export type ClientComponents = ReturnType<typeof createClientComponents>;

export function createClientComponents({ components }: SetupNetworkResult) {
  
  return {
    ...components,
    TCMPopStar: overridableComponent(components.TCMPopStar),
    TokenBalance: overridableComponent(components.TokenBalance),
    RankingRecord: overridableComponent(components.RankingRecord),
    WeeklyRecord: overridableComponent(components.WeeklyRecord),
    ScoreChal: overridableComponent(components.ScoreChal),
    // add your client components or overrides here
  };
}
