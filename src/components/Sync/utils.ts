import {
  UnsavedExperiencesProps,
  SavedExperiencesUnsavedEntriesProps
} from "../../state/sync-unsaved-resolver";
import {
  UploadUnsavedExperiencesMutationProps,
  UploadAllUnsavedsMutationProps
} from "../../graphql/upload-unsaveds.mutation";
import { CreateEntriesMutationGqlProps } from "../../graphql/create-entries.mutation";
import immer from "immer";
import { Reducer } from "react";
import { RouteComponentProps } from "@reach/router";
import { ExperienceFragment_fieldDefs } from "../../graphql/apollo-types/ExperienceFragment";
import { UploadAllUnsavedsMutation } from "../../graphql/apollo-types/UploadAllUnsavedsMutation";
import { WithApolloClient } from "react-apollo";

interface OwnProps
  extends UnsavedExperiencesProps,
    SavedExperiencesUnsavedEntriesProps,
    RouteComponentProps,
    WithApolloClient<{}> {}

export interface Props
  extends OwnProps,
    UploadUnsavedExperiencesMutationProps,
    CreateEntriesMutationGqlProps,
    UploadAllUnsavedsMutationProps {}

interface State {
  readonly tabs: { [k: number]: boolean };
  readonly uploading?: boolean;
  readonly uploadResult?: UploadAllUnsavedsMutation;
}

export enum ActionType {
  toggleTab = "@components/sync/toggle-tab",
  setUploading = "@components/sync/set-uploading",
  uploadResult = "@components/sync/upload-result"
}

interface Action {
  type: ActionType;
  payload?: number | boolean | UploadAllUnsavedsMutation | undefined;
}

export const reducer: Reducer<State, Action> = (
  prevState,
  { type, payload }
) => {
  return immer(prevState, proxy => {
    switch (type) {
      case ActionType.toggleTab:
        proxy.tabs = { [payload as number]: true };
        break;

      case ActionType.setUploading:
        proxy.uploading = payload as boolean;
        break;

      case ActionType.uploadResult:
        proxy.uploadResult = payload as UploadAllUnsavedsMutation;
        proxy.uploading = false;
        break;
    }
  });
};

export function fieldDefToUnsavedData(
  value: ExperienceFragment_fieldDefs | null
) {
  const { clientId, name, type } = value as ExperienceFragment_fieldDefs;

  return { clientId, name, type };
}
