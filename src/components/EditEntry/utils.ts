import { EntryFragment } from "../../graphql/apollo-types/EntryFragment";
import { DataDefinitionFragment } from "../../graphql/apollo-types/DataDefinitionFragment";
import { Dispatch, Reducer, createContext } from "react";
import immer from "immer";

export enum ActionTypes {
  EDIT_BTN_CLICKED = "@component/edit-entry/edit-btn-clicked",
  TITLE_CHANGED = "@component/edit-entry/title-changed",
  TITLE_RESET = "@component/edit-entry/title-reset",
  TITLE_EDIT_DISMISS = "@component/edit-entry/title-dismiss",
  TITLE_EDIT_SUBMIT = "@component/edit-entry/title-submit",
}

export const initialStateFromProps = (props: Props): State => {
  const { definitions } = props;

  const initialDefinitionsStates = definitions.reduce(
    (acc, definition) => {
      acc[definition.id] = {
        state: "idle",
        formValue: definition.name,
      };

      return acc;
    },
    {} as DefinitionsStates,
  );

  return {
    definitionsStates: initialDefinitionsStates,
    state: "nothing",
  };
};

export const reducer: Reducer<State, Action> = (
  prevState,
  { type, ...payload },
) => {
  return immer(prevState, proxy => {
    switch (type) {
      case ActionTypes.EDIT_BTN_CLICKED:
      case ActionTypes.TITLE_RESET:
        {
          const { id } = payload as IdString;

          proxy.definitionsStates[id].state = "pristine";
        }

        break;

      case ActionTypes.TITLE_CHANGED:
        {
          const { id, formValue } = payload as TitleChangedPayload;
          const definition = proxy.definitionsStates[id];
          definition.state = "dirty";
          definition.formValue = formValue;
        }

        break;

      case ActionTypes.TITLE_EDIT_DISMISS:
        {
          const { id } = payload as IdString;
          proxy.definitionsStates[id].state = "idle";
        }

        break;

      case ActionTypes.TITLE_EDIT_SUBMIT:
        {
          proxy.state = "submitting";
        }

        break;
    }
  });
};

export const DefinitionsContext = createContext<DefinitionsContextValues>(
  {} as DefinitionsContextValues,
);

export const DefinitionsContextProvider = DefinitionsContext.Provider;

export interface State {
  readonly definitionsStates: DefinitionsStates;
  readonly state: "nothing" | "submitting";
}

type Action =
  | {
      type: ActionTypes.EDIT_BTN_CLICKED;
      id: string;
    }
  | {
      type: ActionTypes.TITLE_CHANGED;
    } & TitleChangedPayload
  | {
      type: ActionTypes.TITLE_RESET;
      id: string;
    }
  | {
      type: ActionTypes.TITLE_EDIT_DISMISS;
      id: string;
    }
  | {
      type: ActionTypes.TITLE_EDIT_SUBMIT;
    };

type TitleChangedPayload = {
  id: string;
  formValue: string;
};

export interface Props {
  entry: EntryFragment;
  definitions: DataDefinitionFragment[];
  onDefinitionsEdit: () => {};
}

export interface DefaultDefinitionsMap {
  [k: string]: DataDefinitionFragment;
}

export type DefinitionFormValue = Pick<
  DataDefinitionFragment,
  Exclude<keyof DataDefinitionFragment, "__typename" | "clientId" | "type">
>;

export interface FormValues {
  definitions: DefinitionFormValue[];
}

export type DispatchType = Dispatch<Action>;

export interface DefinitionState {
  state: "idle" | "pristine" | "dirty";
  formValue: string;
}

export interface DefinitionsStates {
  [k: string]: DefinitionState;
}

interface IdString {
  id: string;
}

interface DefinitionsContextValues {
  defaultDefinitionsMap: DefaultDefinitionsMap;
  dispatch: DispatchType;
}
