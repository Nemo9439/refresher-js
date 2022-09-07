/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

(function () {
  const SECOND_IN_MS = 1000;
  const MINUTE_IN_MS = 60 * SECOND_IN_MS;
  const DOM_ELEMENT_ID = 'refresher-js-toast';
  const SCRIPT_TAG_ID = 'refresher-js-script';

  let isUserActive = false;

  createToastElement = () => {
    const toastDiv = document.createElement('div');

    toastDiv.id = DOM_ELEMENT_ID;

    const htmlTemplate = `
                          <svg class="close-btn" viewPort="0 0 12 12" version="1.1"
                                              xmlns="http://www.w3.org/2000/svg" onclick="closeToast()">
                                              <line x1="1" y1="11"
                                                    x2="11" y2="1"
                                                    stroke="black"
                                                    stroke-width="2"/>
                                              <line x1="1" y1="1"
                                                    x2="11" y2="11"
                                                    stroke="black"
                                                    stroke-width="2"/>
                            </svg>
                        <h1>New version is available</h1>
                        <p>Please refresh the page</p>
                        <div class="buttons">
                          <button class="refresh" onclick="refresh()">Refresh</button>

                `;

    toastDiv.innerHTML = htmlTemplate;

    document.body.appendChild(toastDiv);
    appendCustomCss(toastDiv);

    return toastDiv;
  };

  appendCustomCss = (element) => {
    const style = document.createElement('style');

    element.appendChild(style);
    style.innerHTML = `
  #${DOM_ELEMENT_ID} {
    background: white;
    position: fixed;
    display: block;
    width: 400px;
    bottom: 0;
    left: 20px;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
    transition: 0.3s transform;
    border: 1px solid #efefef;
    transform: translate(0, 100%);
  }

  #${DOM_ELEMENT_ID}.opened {
    transform: translate(0, -15%);
  }

  #${DOM_ELEMENT_ID} .close-btn {
    position: absolute;
    right: 20px;
    top: 20px;
    width: 15px;
    height: 15px;
    cursor: pointer;
    opacity: 0.6;
    transition: 0.3s;
  }

  #${DOM_ELEMENT_ID} .close-btn:hover {
    opacity: 1;
  }

  #${DOM_ELEMENT_ID} .buttons {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  #${DOM_ELEMENT_ID} button {
    border-width: 0;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    outline: none;
    transition: filter 0.3s;
  }

  #${DOM_ELEMENT_ID} button.refresh {
    color: #fff;
    background-color: #004dff;
    filter: saturate(0.7)
  }

  #${DOM_ELEMENT_ID} button.refresh:hover {
    filter: saturate(1)
  }

  #${DOM_ELEMENT_ID} h1 {
    font-size: 2.4rem;
    font-weight: 700;
    margin: 0;
  }

  #${DOM_ELEMENT_ID} p {
        margin: 0;
  }

  `;
  };

  openToastLater = () => {
    setTimeout(() => {
      openToast();
    }, pollingIntervalInMinutes * MINUTE_IN_MS);
  };

  refresh = () => {
    location.reload(true);
  };

  closeToast = () => {
    const toastElement = getToastElement();

    toastElement.classList.remove('opened');
    setTimeout(() => {
      toastElement.remove();
    }, SECOND_IN_MS);
    openToastLater();
  };

  openToast = () => {
    if (getToastElement()) {
      return;
    }

    const toastElement = createToastElement();

    setTimeout(() => {
      toastElement.classList.add('opened');
    }, SECOND_IN_MS);
  };

  getToastElement = () => {
    return document.getElementById(DOM_ELEMENT_ID);
  };

  getPollingResourceSrc = () => {
    const scripts = [...document.getElementsByTagName('script')];

    const angularMainScript = scripts.filter(
      (script) => script?.src?.includes('main.') && script?.type === 'module'
    )?.[0];

    return angularMainScript?.src;
  };

  getRefresherScriptTag = () => {
    return document.getElementById(SCRIPT_TAG_ID);
  };

  subscribeToActivityEvents = () => {
    document.onvisibilitychange = () => {
      if (document.visibilityState === 'visible') {
        isUserActive = true;
      }
    };

    onclick = () => {
      isUserActive = true;
    };
  };

  const xhttp = new XMLHttpRequest();

  xhttp.onload = (data) => {
    const status = data?.target?.status;

    if (status === 404) {
      openToast();
      clearInterval(intervalId);
    }
  };

  const scriptTag = getRefresherScriptTag();
  const pollingIntervalInMinutes = scriptTag.getAttribute('data-polling-interval-in-minutes') ?? 120;

  const pollingResourceSrc = getPollingResourceSrc();

  subscribeToActivityEvents();

  const intervalId = setInterval(() => {
    if (getToastElement()) {
      return;
    }

    if (!isUserActive) {
      return;
    }

    isUserActive = false;

    xhttp.open('GET', pollingResourceSrc);
    xhttp.send();
  }, pollingIntervalInMinutes * MINUTE_IN_MS);
})();
