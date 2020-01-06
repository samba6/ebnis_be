/* eslint-disable react-hooks/rules-of-hooks */
import { ApolloClient } from "apollo-client";
import { CreateOnlineEntryMutation } from "../../graphql/apollo-types/CreateOnlineEntryMutation";
import { newEntryResolvers } from "./new-entry.resolvers";
import immer from "immer";
import {
  ExperienceFragment,
  ExperienceFragment_entries,
  ExperienceFragment_entries_edges_node,
  ExperienceFragment_entries_edges,
} from "../../graphql/apollo-types/ExperienceFragment";
import { DataProxy } from "apollo-cache";
import { FetchResult } from "apollo-link";
import { readExperienceFragmentFromCache } from "../../state/resolvers/read-get-experience-full-query-from-cache";
import { entryToEdge } from "../../state/resolvers/entry-to-edge";
import { EntryFragment } from "../../graphql/apollo-types/EntryFragment";
import { writeExperienceFragmentToCache } from "../../state/resolvers/write-experience-fragment-to-cache";

// istanbul ignore next:
export function addNewEntryResolvers(client: ApolloClient<{}>) {
  if (window.____ebnis.newEntryResolversAdded) {
    return;
  }

  client.addResolvers(newEntryResolvers);
  window.____ebnis.newEntryResolversAdded = true;
}

type Fn<T = string | ExperienceFragment> = (
  experienceOrId: T,
  mode: "online" | "offline",
) => (
  proxy: DataProxy,
  mutationResult: FetchResult<CreateOnlineEntryMutation>,
) => T extends ExperienceFragment
  ? Promise<ExperienceFragment>
  : Promise<ExperienceFragment | undefined>;

/**
 * Upsert the entry into the experience and updates the Get full experience
 * query
 */
export const upsertExperienceWithEntry: Fn = function updateFn(
  experienceOrId,
  mode,
) {
  return async function updateFnInner(
    dataProxy,
    { data: createEntryResponse },
  ) {
    const entry = (createEntryResponse &&
      createEntryResponse.createEntry &&
      createEntryResponse.createEntry.entry) as EntryFragment;

    let experience = experienceOrId as ExperienceFragment | null;

    if (typeof experienceOrId === "string") {
      if (!entry) {
        return;
      }

      experience = readExperienceFragmentFromCache(dataProxy, experienceOrId);

      if (!experience) {
        return;
      }
    }

    const updatedExperience = immer(experience as ExperienceFragment, proxy => {
      const entries = proxy.entries as ExperienceFragment_entries;
      const edges = entries.edges || [];

      const existingEntry = edges.find(
        e =>
          ((e as ExperienceFragment_entries_edges).node as EntryFragment).id ===
          entry.id,
      );

      if (existingEntry) {
        existingEntry.node = entry;
        if (mode === "offline") {
          proxy.hasUnsaved = true;
        }
      } else {
        edges.unshift(
          entryToEdge(entry as ExperienceFragment_entries_edges_node),
        );
      }

      entries.edges = edges;
      proxy.entries = entries;
    });

    writeExperienceFragmentToCache(dataProxy, updatedExperience);
    return updatedExperience;
  };
};
