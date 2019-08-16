// tslint:disable: no-any
import React, { ComponentType } from "react";
import "jest-dom/extend-expect";
import "react-testing-library/cleanup-after-each";
import { render } from "react-testing-library";
import { Entry } from "../components/Entry/component";
import { Props, reducer, State } from "../components/Entry/utils";
import { EntryFragment } from "../graphql/apollo-types/EntryFragment";
import { ExperienceFragment_dataDefinitions } from "../graphql/apollo-types/ExperienceFragment";
import { FieldType } from "../graphql/apollo-types/globalTypes";
import {
  Props as EditEntryProps,
  ActionTypes as EditEntryActionTypes,
} from "../components/EditEntry/utils";

jest.mock("../components/EditEntry", () => ({
  EditEntry: jest.fn(() => {
    return <div id="edit-entry" />;
  }),
}));
import { EditEntry } from "../components/EditEntry";
const mockEditEntry = EditEntry as jest.Mock;

const EntryP = Entry as ComponentType<Partial<Props>>;

it("renders single line text", () => {
  const entry = {
    id: "1",
    dataObjects: [
      {
        definitionId: "1",
        data: `{"SINGLE_LINE_TEXT":"c1"}`,
      },
    ],
  } as EntryFragment;

  const { ui } = makeComp({
    props: {
      entry,

      entriesLen: 1,

      definitions: [
        {
          id: "1",
          name: "f1",
          type: FieldType.SINGLE_LINE_TEXT,
        },
      ] as ExperienceFragment_dataDefinitions[],
    },
  });

  const {} = render(ui);

  (document.getElementById(`entry-1-edit-trigger`) as HTMLElement).click();

  const lastRender = mockEditEntry.mock.calls.length - 1;

  expect(
    (mockEditEntry.mock.calls[lastRender][0] as EditEntryProps).entry.id,
  ).toEqual("1");
});

it("renders multi line text", () => {
  const entry = {
    id: "2",
    dataObjects: [
      {
        definitionId: "2",
        data: `{"MULTI_LINE_TEXT":"c2"}`,
      },
    ],
  } as EntryFragment;

  const { ui } = makeComp({
    props: {
      entry,

      definitions: [
        {
          id: "2",
          name: "f2",
          type: FieldType.MULTI_LINE_TEXT,
        },
      ] as ExperienceFragment_dataDefinitions[],
    },
  });

  render(ui);

  expect(
    (document.getElementById(`entry-2-2-value`) as HTMLDivElement).textContent,
  ).toContain("c2");
});

it("renders date field", () => {
  const entry = {
    id: "3",
    dataObjects: [
      {
        definitionId: "3",
        data: `{"DATE":"2019-05-01"}`,
      },
    ],
  } as EntryFragment;

  const { ui } = makeComp({
    props: {
      entry,

      definitions: [
        {
          id: "3",
          name: "f3",
          type: FieldType.DATE,
        },
      ] as ExperienceFragment_dataDefinitions[],
    },
  });

  render(ui);

  expect(
    (document.getElementById(`entry-3-3-value`) as HTMLDivElement).textContent,
  ).toContain("2019");
});

it("renders datetime field", () => {
  const entry = {
    id: "4",
    dataObjects: [
      {
        definitionId: "4",
        data: `{"DATETIME":"2019-05-01"}`,
      },
    ],
  } as EntryFragment;

  const { ui } = makeComp({
    props: {
      entry,

      definitions: [
        {
          id: "4",
          name: "f4",
          type: FieldType.DATETIME,
        },
      ] as ExperienceFragment_dataDefinitions[],
    },
  });

  render(ui);
});

it("renders decimal field", () => {
  const entry = {
    id: "5",
    dataObjects: [
      {
        definitionId: "5",
        data: `{"DECIMAL":"500.689"}`,
      },
    ],
  } as EntryFragment;

  const { ui } = makeComp({
    props: {
      entry,

      definitions: [
        {
          id: "5",
          name: "f5",
          type: FieldType.DECIMAL,
        },
      ] as ExperienceFragment_dataDefinitions[],
    },
  });

  render(ui);

  expect(document.getElementById("entry-container-5")).not.toBeNull();
});

it("renders integer field and uses custom container id", () => {
  const entry = {
    id: "6",
    dataObjects: [
      {
        definitionId: "6",
        data: `{"INTEGER":"567012"}`,
      },
    ],
  } as EntryFragment;

  const { ui } = makeComp({
    props: {
      id: "custom",
      entry,

      definitions: [
        {
          id: "6",
          name: "f6",
          type: FieldType.INTEGER,
        },
      ] as ExperienceFragment_dataDefinitions[],
    },
  });

  render(ui);

  expect(document.getElementById("custom")).not.toBeNull();
  expect(document.getElementById("entry-container-6")).toBeNull();
});

test("reducer", () => {
  let state: State = {
    stateValue: "idle",
  };

  state = reducer(state, { type: EditEntryActionTypes.DESTROYED });
  expect(state.stateValue).toEqual("idle");

  state = reducer(state, { type: "bogus" } as any);
  expect(state.stateValue).toEqual("idle");
});

////////////////////////// HELPER FUNCTIONS ///////////////////////////

function makeComp({ props = {} }: { props?: Partial<Props> } = {}) {
  mockEditEntry.mockClear();

  return {
    ui: <EntryP {...props} />,
  };
}
