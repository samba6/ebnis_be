export const MY_TITLE = "Experiences";
export const domPrefix = "my";

export const activateInsertExperienceDomId = `${domPrefix}-activate-insert-experience`;
export const fetchExperiencesErrorsDomId = `${domPrefix}-fetch-experiences-errors`;
export const noExperiencesActivateNewDomId = `${domPrefix}-no-experiences-activate-new`;
export const experiencesDomId = `${domPrefix}-experiences`;
export const searchInputDomId = `${domPrefix}-search-input`;
export const fetchErrorRetryDomId = `${domPrefix}-fetch-error-retry`;

export const isOfflineClassName = "experience--is-danger";
export const isPartOfflineClassName = "experience--is-warning";
export const descriptionMoreClassName = "description__control--more";
export const descriptionSummaryClassName = "description__text--summary";
export const descriptionFullClassName = "description__text--full";
export const descriptionLessClassName = "description__control--less";
export const descriptionControlClassName = "description__control";
export const dropdownTriggerClassName = `js-${domPrefix}-experience-menu-trigger`;
export const dropdownIsActiveClassName = "is-active";
export const onDeleteExperienceSuccessNotificationId = `${domPrefix}-on-delete-experience-success-notification`;
export const onDeleteExperienceCancelledNotificationId = `${domPrefix}-on-delete-experience-cancelled-notification`;
export const updateExperienceMenuItemSelector = `js-${domPrefix}-update-experience-menu-item`;
export const updateExperienceSuccessNotificationCloseClassName = `js-${domPrefix}-update-experience-success-notification-delete`;
export const experienceContainerSelector = `js-${domPrefix}-experience`;
export const noTriggerDocumentEventClassName = `js-${domPrefix}-no-trigger-document`;

export function makeScrollToDomId(id: string) {
  return `${id}-${domPrefix}-scroll-to`;
}
