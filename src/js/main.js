console.log('Zenhub Extension Started!');

const assigneesPullDownElementSelector = '.zhc-menu-bar-item--assignee-filter button';
const assigneesElementSelector = '.zhc-menu-bar-item--assignee-filter .zhc-selectable-selection-item';
const issueCardElementSelector = '.zhc-issue-card';
const issueCardButtonElementSelector = '.zhc-issue-card__actions__btn';
const issuePullDownElementSelector = '.zhc-issue-card-actions-content';
const issuePullDownContainerSelector = '.react-portal-container';
const pipelineBodySelector = '.ReactVirtualized__Grid__innerScrollContainer';

const AdditionalMenuText = 'Select user';

const waitIssueCardLoad = async () => {
  while (true) {
    const loadingElement = document.querySelector(issueCardElementSelector);

    if (loadingElement) {
      return
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

const watchDomChanged = (element, callback) => {
  const mo = new MutationObserver(callback);
  mo.observe(element, { childList: true })
  return mo;
}

const selectAssignee = src => {
  const assigneesPullDownElement = document.querySelector(assigneesPullDownElementSelector);
  assigneesPullDownElement.click();

  const assigneesElements = document.querySelectorAll(assigneesElementSelector);

  const assigneesElement = Array.from(assigneesElements).find(element => {
    const img = element.querySelector('img');

    return img && img.src === src;
  })

  if (assigneesElement) {
    assigneesElement.click();
  }
  assigneesPullDownElement.click();
}

const createIssuePullDownMenuItem = () => {
  const div = document.createElement('div');
  const text = document.createTextNode(AdditionalMenuText)
  div.appendChild(text)
  return div;
}

const setAdditionalEventToIssueCard = card => {
  const iconElement = card.querySelector('img')

  if (iconElement) {
    const iconSrc = iconElement.src;

    watchDomChanged(card, () => {
      const button = card.querySelector(issueCardButtonElementSelector);

      if (button) {
        button.addEventListener('click', () => {
          const mo = watchDomChanged(document.body, () => {
            mo.disconnect();
            const containerElement = document.querySelector(issuePullDownContainerSelector);
            const issuePullDownElement = containerElement.querySelector(issuePullDownElementSelector);

            if (!issuePullDownElement.textContent.includes(AdditionalMenuText)) {
              const menuItemElement = createIssuePullDownMenuItem();
              menuItemElement.addEventListener('click', () => {
                selectAssignee(iconSrc);
              })

              issuePullDownElement.appendChild(menuItemElement);
            }
          })
        })
      }
    })
  }
}

const setAdditionalEventToIssueCards = elements => {
  Array.from(elements).forEach(card => setAdditionalEventToIssueCard(card))
}

window.addEventListener("load", async () => {
  await waitIssueCardLoad();
  console.log('Issue card loaded')

  const pipelines = Array.from(document.querySelectorAll(pipelineBodySelector));
  pipelines.forEach(element => {
    watchDomChanged(element, () => {
      setAdditionalEventToIssueCards(document.querySelectorAll(issueCardElementSelector))
    })
  })

  setAdditionalEventToIssueCards(document.querySelectorAll(issueCardElementSelector))
});

