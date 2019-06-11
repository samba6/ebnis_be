import { USER_REGISTRATION_OBJECT } from "../support/user-registration-object";
import { FieldType } from "../../src/graphql/apollo-types/globalTypes";
import { makeNewEntryRoute } from "../../src/constants/new-entry-route";
import { ManualConnectionStatus } from "../../src/test-utils/manual-connection-setting";

context("new experience entry page", () => {
  beforeEach(() => {
    cy.closeSession();
    cy.checkoutSession();
    cy.registerUser(USER_REGISTRATION_OBJECT);
  });

  const title = "My experience no. 1";

  it("creates entry successfully when user online", () => {
    /**
     * Given there is an experience in the system with no entries
     */
    const fieldName = "Total purchases";

    cy.defineExperience({
      title,
      fieldDefs: [
        {
          name: fieldName,
          type: FieldType.INTEGER
        }
      ]
    }).then(experience => {
      /**
       * And user wishes to create new entry
       */
      const fieldValue = "4567890";
      const fieldValueRegex = new RegExp(fieldValue);

      /**
       * When we visit new entry page
       */
      cy.visit(makeNewEntryRoute(experience.id));

      /**
       * Then we should see the title
       */
      cy.title().should("contain", `[New Entry] ${title}`);

      /**
       * And data user wishes to create should not exist on page
       */
      cy.queryByText(fieldValueRegex).should("not.exist");

      /**
       * When user completes and submits the form
       */
      cy.getByLabelText(new RegExp(fieldName, "i")).type(fieldValue);
      cy.getByText(/submit/i).click();

      /**
       * Then user should redirected to experience page
       */
      cy.title().should("not.contain", `[New Entry]`);
      cy.title().should("contain", title);

      /**
       * And data user wishes to create should exist on page
       */
      cy.getByText(fieldValueRegex).should("exist");
    });
  });

  it("creates entry successfully when user offline", () => {
    /**
     * Given there is an experience in the system with no entries
     */
    const fieldName = "Total purchases";

    cy.defineExperience({
      title,
      fieldDefs: [
        {
          name: fieldName,
          type: FieldType.INTEGER
        }
      ]
    }).then(experience => {
      /**
       * And user wishes to create new entry
       */
      const fieldValue = "4567890";
      const fieldValueRegex = new RegExp(fieldValue);

      /**
       * When we visit new entry page
       */
      cy.visit(makeNewEntryRoute(experience.id));

      /**
       * Then we should see the title
       */
      cy.title().should("contain", `[New Entry] ${title}`);

      /**
       * And data user wishes to create should not exist on page
       */
      cy.queryByText(fieldValueRegex).should("not.exist");

      cy.setConnectionStatus(ManualConnectionStatus.disconnected);

      /**
       * When user completes and submits the form
       */
      cy.getByLabelText(new RegExp(fieldName, "i")).type(fieldValue);
      cy.getByText(/submit/i).click();

      /**
       * Then user should redirected to experience page
       */
      cy.title().should("not.contain", `[New Entry]`);
      cy.title().should("contain", title);

      /**
       * And data user wishes to create should exist on page
       */
      cy.getByText(fieldValueRegex).should("exist");
    });
  });
});
