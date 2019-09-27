import {
  ExperienceFragment,
  ExperienceFragment_entries_edges,
  ExperienceFragment_entries_edges_node,
} from "../graphql/apollo-types/ExperienceFragment";
import gql from "graphql-tag";
import { LocalResolverFn } from "./resolvers";
import { isUnsavedId } from "../constants";
import { readGetExperienceFullQueryFromCache } from "./resolvers/read-get-experience-full-query-from-cache";
import { getSavedAndUnsavedExperiencesFromCache } from "./resolvers/get-saved-and-unsaved-experiences-from-cache";
import ApolloClient from "apollo-client";
import { QueryResult } from "@apollo/react-common";

export const SAVED_AND_UNSAVED_EXPERIENCES_QUERY = gql`
  {
    savedAndUnsavedExperiences @client {
      id
      unsavedEntriesCount
    }
  }
`;

export async function getUnsavedCount(client: ApolloClient<{}>) {
  return (await getSavedAndUnsavedExperiencesFromCache(client)).reduce(
    (acc, { id, unsavedEntriesCount }) => {
      acc += unsavedEntriesCount;

      if (isUnsavedId(id)) {
        ++acc;
      }

      return acc;
    },
    0,
  );
}

export function entryNodesFromExperience({ entries }: ExperienceFragment) {
  return ((entries.edges as ExperienceFragment_entries_edges[]) || []).map(
    (edge: ExperienceFragment_entries_edges) => {
      return edge.node as ExperienceFragment_entries_edges_node;
    },
  );
}

type SavedAndUnsavedExperiencesTypeName = "SavedAndUnsavedExperiences";

export const SAVED_AND_UNSAVED_EXPERIENCE_TYPENAME = "SavedAndUnsavedExperiences" as SavedAndUnsavedExperiencesTypeName;

export interface SavedAndUnsavedExperiences {
  id: string;
  unsavedEntriesCount: number;
  __typename: SavedAndUnsavedExperiencesTypeName;
}

export interface SavedAndUnsavedExperiencesQueryReturned {
  savedAndUnsavedExperiences: SavedAndUnsavedExperiences[];
}

export const GET_ALL_UNSAVED_QUERY = gql`
  {
    getAllUnsaved @client
  }
`;

export interface GetAllUnSavedQueryReturned {
  getAllUnsaved: GetUnsavedSummary;
}

export type GetAllUnsavedQueryResult = QueryResult<GetAllUnSavedQueryReturned>;

const getAllUnsavedResolver: LocalResolverFn<
  {},
  Promise<GetUnsavedSummary>
> = async (_root, _variables, { cache, client }) => {
  let neverSavedCount = 0;
  let partlySavedCount = 0;
  const neverSavedMap = {} as UnsavedExperienceSummaryMap;
  const partlySavedMap = {} as UnsavedExperienceSummaryMap;

  (await getSavedAndUnsavedExperiencesFromCache(client)).forEach(
    ({ id: id }) => {
      const experience = readGetExperienceFullQueryFromCache(cache, id);

      if (experience) {
        if (isUnsavedId(id)) {
          ++neverSavedCount;
          neverSavedMap[id] = {
            experience,
            savedEntries: [],
            unsavedEntries: entryNodesFromExperience(experience),
          };
        } else {
          ++partlySavedCount;

          partlySavedMap[id] = {
            experience,
            ...separateExperienceUnsavedEntries(experience),
          };
        }
      }
    },
  );

  return {
    neverSavedMap,
    partlySavedMap,
    neverSavedCount,
    partlySavedCount,
  };
};

function separateExperienceUnsavedEntries({ entries }: ExperienceFragment) {
  let unsavedEntries: ExperienceFragment_entries_edges_node[] = [];
  let savedEntries: ExperienceFragment_entries_edges_node[] = [];

  ((entries.edges as ExperienceFragment_entries_edges[]) || []).forEach(
    (edge: ExperienceFragment_entries_edges) => {
      const node = edge.node as ExperienceFragment_entries_edges_node;

      if (isUnsavedId(node.id)) {
        unsavedEntries.push(node);
      } else {
        savedEntries.push(node);
      }
    },
  );

  return { unsavedEntries, savedEntries };
}

export const DEFAULT_UNSAVED_STATES = {
  savedAndUnsavedExperiences: [],
};

export const unsavedResolvers = {
  Mutation: {},

  Query: { getAllUnsaved: getAllUnsavedResolver },
};

export interface GetUnsavedSummary {
  neverSavedMap: UnsavedExperienceSummaryMap;
  partlySavedMap: UnsavedExperienceSummaryMap;
  neverSavedCount: number;
  partlySavedCount: number;
}

interface UnsavedExperienceSummaryMap {
  [K: string]: SavedAndUnsavedExperienceSummary;
}

export interface SavedAndUnsavedExperienceSummary {
  unsavedEntries: ExperienceFragment_entries_edges_node[];
  experience: ExperienceFragment;
  savedEntries: ExperienceFragment_entries_edges_node[];
}
