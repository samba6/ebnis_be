// tslint:disable: no-any
import React, { ComponentType } from "react";
import "jest-dom/extend-expect";
import "react-testing-library/cleanup-after-each";
import { render, fireEvent, wait } from "react-testing-library";
import { Sync } from "../components/Sync/component";
import { Props, fieldDefToUnsavedData } from "../components/Sync/utils";
import { ExperienceFragment } from "../graphql/apollo-types/ExperienceFragment";
import { makeUnsavedId } from "../constants";
import { renderWithRouter } from "./test_utils";

jest.mock("../components/Loading", () => ({
  Loading: () => <div data-testid="loading" />
}));

jest.mock("../components/SidebarHeader", () => ({
  SidebarHeader: ({ children }: any) => {
    return <> {children} </>;
  }
}));

jest.mock("../state/get-conn-status");

import { getConnStatus } from "../state/get-conn-status";

const mockGetConnectionStatus = getConnStatus as jest.Mock;

const SyncP = Sync as ComponentType<Partial<Props>>;
const timeStamps = { insertedAt: "a", updatedAt: "a" };

it("redirects to 404 when not connected", async done => {
  const { ui, mockNavigate } = makeComp({
    isConnected: false
  });

  const { queryByTestId } = render(ui);

  await wait(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/404");
  });

  expect(queryByTestId("loading")).not.toBeInTheDocument();

  done();
});

it("renders loading indicator while unsaved experiences loading", () => {
  const { ui } = makeComp({
    props: {
      unSavedExperiencesProps: { loading: true } as any
    }
  });

  const { queryByTestId } = render(ui);

  expect(queryByTestId("loading")).toBeInTheDocument();
});

it("renders loading indicator while unsaved entries for saved experiences loading", () => {
  const { ui } = makeComp({
    props: {
      savedExperiencesUnSavedEntriesProps: { loading: true } as any
    }
  });

  const { queryByTestId } = render(ui);

  expect(queryByTestId("loading")).toBeInTheDocument();
});

it("shows there are no unsaved data", () => {
  const { ui } = makeComp({
    props: {
      unSavedExperiencesProps: { unsavedExperiences: [] } as any,
      savedExperiencesUnSavedEntriesProps: {
        savedExperiencesUnsavedEntries: []
      } as any
    }
  });

  const { queryByTestId } = render(ui);

  expect(queryByTestId("loading")).not.toBeInTheDocument();
  expect(queryByTestId("no-unsaved")).toBeInTheDocument();
});

it("shows only saved experiences, does not show saved entries and uploads unsaved entries", async done => {
  const { id: entryId, ...entry } = {
    ...makeEntryNode(makeUnsavedId("1")),
    clientId: "a",
    expId: "1",
    ...timeStamps
  };

  const experiences = [
    {
      id: "1",
      title: "a",

      entries: {
        edges: [
          {
            node: { ...entry, id: entryId }
          },

          {
            node: {
              id: "2"
            }
          }
        ]
      },

      fieldDefs: makeFieldDefs()
    }
  ] as ExperienceFragment[];

  const {
    ui,
    mockUploadUnsavedExperiences,
    mockUploadSavedExperiencesEntries,
    mockUploadAllUnsaveds
  } = makeComp({
    props: {
      savedExperiencesUnSavedEntriesProps: {
        savedExperiencesUnsavedEntries: experiences
      } as any
    }
  });

  mockUploadSavedExperiencesEntries.mockResolvedValue({
    data: {
      createEntries: {}
    }
  });

  const { queryByTestId, getAllByTestId } = render(ui);

  expect(queryByTestId("no-unsaved")).not.toBeInTheDocument();

  expect(getAllByTestId("saved-experience").length).toBe(1);

  expect(queryByTestId("saved-experiences-menu")).toBeInTheDocument();
  expect(queryByTestId("unsaved-experiences")).not.toBeInTheDocument();
  expect(queryByTestId("unsaved-experiences-menu")).not.toBeInTheDocument();

  expect(queryByTestId("uploading-data")).not.toBeInTheDocument();

  fireEvent.click(queryByTestId("upload-all") as any);

  await wait(() => {
    expect(mockUploadSavedExperiencesEntries).toHaveBeenCalled();
  });

  const uploadedEntry = (mockUploadSavedExperiencesEntries.mock
    .calls[0][0] as any).variables.createEntries[0];

  expect(uploadedEntry).toEqual(entry);

  expect(mockUploadUnsavedExperiences).not.toHaveBeenCalled();
  expect(mockUploadAllUnsaveds).not.toHaveBeenCalled();

  done();
});

it("shows only 'unsaved experiences' data and uploads same succeeds", async done => {
  const experience = {
    title: "a",
    clientId: "1",
    description: "x",
    fieldDefs: makeFieldDefs(),
    ...timeStamps
  };

  const { id: entryId, ...entry } = {
    ...makeEntryNode(),
    clientId: "b",
    expId: "1",
    ...timeStamps
  };

  const unsavedExperience = {
    id: "1",
    ...experience,

    entries: {
      edges: [
        {
          node: { ...entry, id: entryId }
        }
      ]
    }
  };

  const {
    ui,
    mockUploadUnsavedExperiences,
    mockUploadSavedExperiencesEntries,
    mockUploadAllUnsaveds
  } = makeComp({
    props: {
      unSavedExperiencesProps: {
        unsavedExperiences: [unsavedExperience]
      } as any
    }
  });

  mockUploadUnsavedExperiences.mockResolvedValue({
    data: {
      syncOfflineExperiences: [
        {
          experience: unsavedExperience
        }
      ]
    }
  });

  const { queryByTestId } = render(ui);

  expect(queryByTestId("saved-experiences")).not.toBeInTheDocument();
  expect(queryByTestId("saved-experiences-menu")).not.toBeInTheDocument();

  expect(queryByTestId("unsaved-experiences")).toBeInTheDocument();
  expect(queryByTestId("unsaved-experiences-menu")).toBeInTheDocument();

  expect(queryByTestId("uploading-data")).not.toBeInTheDocument();

  fireEvent.click(queryByTestId("upload-all") as any);

  await wait(() => {
    expect(mockUploadUnsavedExperiences).toHaveBeenCalled();
  });

  const {
    entries: uploadedEntries,

    ...otherExperienceFields
  } = (mockUploadUnsavedExperiences.mock.calls[0][0] as any).variables.input[0];

  experience.fieldDefs = experience.fieldDefs.map(fieldDefToUnsavedData as any);

  expect(otherExperienceFields).toEqual(experience);

  expect(uploadedEntries[0]).toEqual(entry);

  expect(mockUploadSavedExperiencesEntries).not.toHaveBeenCalled();
  expect(mockUploadAllUnsaveds).not.toHaveBeenCalled();

  expect(queryByTestId("upload-all")).not.toBeInTheDocument();

  done();
});

it("toggles saved and 'unsaved experiences' data", async done => {
  jest.useFakeTimers();

  const {
    ui,
    mockUploadUnsavedExperiences,
    mockUploadSavedExperiencesEntries,
    mockUploadAllUnsaveds
  } = makeComp({
    props: {
      unSavedExperiencesProps: {
        unsavedExperiences: [
          {
            id: "1",
            title: "a",

            entries: {
              edges: [
                {
                  node: makeEntryNode()
                }
              ]
            },

            fieldDefs: makeFieldDefs()
          }
        ]
      } as any,

      savedExperiencesUnSavedEntriesProps: {
        savedExperiencesUnsavedEntries: [
          {
            id: "1",
            title: "a",

            entries: {
              edges: [
                {
                  node: makeEntryNode(makeUnsavedId("1"))
                }
              ]
            },

            fieldDefs: makeFieldDefs()
          }
        ]
      } as any
    }
  });

  mockUploadAllUnsaveds.mockResolvedValue({
    data: {
      createEntries: {},
      syncOfflineExperiences: []
    }
  });

  const { queryByTestId } = render(ui);

  expect(queryByTestId("saved-experiences")).toBeInTheDocument();
  expect(queryByTestId("unsaved-experiences")).not.toBeInTheDocument();

  const $unsavedMenu = queryByTestId("unsaved-experiences-menu") as any;

  fireEvent.click($unsavedMenu);
  jest.runAllTimers();

  expect(queryByTestId("saved-experiences")).not.toBeInTheDocument();
  expect(queryByTestId("unsaved-experiences")).toBeInTheDocument();

  const $savedMenu = queryByTestId("saved-experiences-menu") as any;

  fireEvent.click($savedMenu);
  jest.runAllTimers();

  expect(queryByTestId("saved-experiences")).toBeInTheDocument();
  expect(queryByTestId("unsaved-experiences")).not.toBeInTheDocument();

  fireEvent.click(queryByTestId("upload-all") as any);

  await wait(() => {
    expect(mockUploadAllUnsaveds).toHaveBeenCalled();
  });

  expect(mockUploadUnsavedExperiences).not.toHaveBeenCalled();
  expect(mockUploadSavedExperiencesEntries).not.toHaveBeenCalled();

  done();
});

////////////////////////// HELPER FUNCTIONS ///////////////////////////////////

function makeComp({
  props = {},
  isConnected = true
}: { props?: Partial<Props>; isConnected?: boolean } = {}) {
  mockGetConnectionStatus.mockReset();
  mockGetConnectionStatus.mockResolvedValue(isConnected);

  const mockUploadUnsavedExperiences = jest.fn();
  const mockUploadSavedExperiencesEntries = jest.fn();
  const mockUploadAllUnsaveds = jest.fn();

  const { Ui, ...routerProps } = renderWithRouter(SyncP);

  return {
    ui: (
      <Ui
        uploadUnsavedExperiences={mockUploadUnsavedExperiences}
        createEntries={mockUploadSavedExperiencesEntries}
        uploadAllUnsaveds={mockUploadAllUnsaveds}
        {...props}
      />
    ),

    mockUploadUnsavedExperiences,
    mockUploadSavedExperiencesEntries,
    mockUploadAllUnsaveds,
    ...routerProps
  };
}

function makeEntryNode(id: string = "1") {
  return {
    id,

    fields: [
      {
        defId: "f1",
        data: `{"decimal":1}`
      }
    ]
  };
}

function makeFieldDefs() {
  return [{ id: "f1", type: "DECIMAL" as any }];
}
