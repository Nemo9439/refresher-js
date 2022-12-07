(function () {
  const SECOND_IN_MS = 1000;
  const MINUTE_IN_MS = 60 * SECOND_IN_MS;
  const DOM_ELEMENT_ID = 'refresher-js-toast';
  const SCRIPT_TAG_ID = 'refresher-js-script';
  const OPEN_TOAST_EVENT_NAME = 'refresher-js-open-toast';

  const ANGULAR_AND_REACT_MAIN_SCRIPT_PREFIX = 'main.';
  const VUE_V3_MAIN_SCRIPT_PREFIX = 'index.';
  const VUE_V2_MAIN_SCRIPT_PREFIX = 'app.';
  
  
  const DEFAULTS = {
    PRIMARY_COLOR : '#004dff',
    TITLE_TEXT: 'New version is available',
    SUBTITLE_TEXT: 'Please refresh the page',
    REFRESH_BUTTON_TEXT: 'Refresh',
    POLLING_INTERVAL_IN_MINUTES: 120
  }

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
                        <h2>${titleText}</h2>
                        <p>${subTitleText}</p>
                        <div class="buttons">
                          <button class="refresh" onclick="refresh()">${refreshButtonText}</button>

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
    position: fixed;
    display: block;
    min-width: 150px;
    bottom: 0;
    left: 20px;
    padding: 20px;
    border-radius: 5px;
    background: #ffffffd1;
    box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
    transition: 0.3s transform;
    border: 1px solid #efefef;
    border-left: 5px solid ${primaryColor};
    transform: translate(0, 100%);
    backdrop-filter: blur(10px);
    font-weight: lighter;
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
    z-index: 999;
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
    font-size: 0.9rem;
  }

  #${DOM_ELEMENT_ID} button.refresh {
    color: #fff;
    background-color: ${primaryColor};
    filter: saturate(0.8);
    font-size: 0.9rem;
  }

  #${DOM_ELEMENT_ID} button.refresh:hover {
    filter: saturate(1)
  }

  #${DOM_ELEMENT_ID} h2 {
    font-weight: lighter;
    margin: 0;
    padding-right: 40px;
  }

  #${DOM_ELEMENT_ID} p {
        margin: 0;
        margin-top: 10px;
        opacity: 0.8;
        font-size: 0.9rem;
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
    dispatchOpenToastEvent();

    if (getToastElement()) {
      return;
    }
    
    if(disableToast) {
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

  dispatchOpenToastEvent = () => {
    document.dispatchEvent(new Event(OPEN_TOAST_EVENT_NAME));
  }

  getMainScript = (doc) => {
    const scripts = [...doc.getElementsByTagName('script')];
    const mainScript = scripts.filter((script) => script?.src?.includes(ANGULAR_AND_REACT_MAIN_SCRIPT_PREFIX))?.[0];
    if (!mainScript) {
      const vueScript = scripts.filter((script) => script?.src?.includes(VUE_V2_MAIN_SCRIPT_PREFIX) || script?.src?.includes(VUE_V3_MAIN_SCRIPT_PREFIX))?.[0];
      return vueScript?.src;
    }

    return mainScript?.src;
  };

  getRefresherScriptTag = () => {
    return document.getElementById(SCRIPT_TAG_ID);
  };

  handleCustomFunction = async () => {
      const customFunctionRes = await window[customFunctionName]();
      if (customFunctionRes) {
        openToast();
        clearInterval(intervalId);
      }
      return;
  }

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
    const doc = (new DOMParser).parseFromString(data.target.response, "text/html");

    const nextMainScript = getMainScript(doc);
    if(currentMainScript !== nextMainScript) {
      openToast();
      clearInterval(intervalId);
      currentMainScript = nextMainScript;
    }

  };

  const scriptTag = getRefresherScriptTag();

  const pollingIntervalInMinutes = Number(scriptTag.getAttribute('data-polling-interval-in-minutes')) ?? DEFAULTS.POLLING_INTERVAL_IN_MINUTES;
  const titleText = scriptTag.getAttribute('data-title-text') ?? DEFAULTS.TITLE_TEXT;
  const subTitleText = scriptTag.getAttribute('data-subtitle-text') ?? DEFAULTS.SUBTITLE_TEXT;
  const primaryColor = scriptTag.getAttribute('data-primary-color') ?? DEFAULTS.PRIMARY_COLOR;
  const refreshButtonText = scriptTag.getAttribute('data-refresh-button-text') ?? DEFAULTS.REFRESH_BUTTON_TEXT;
  const disableToast = scriptTag.getAttribute('data-disable-toast') === 'true';
  const customFunctionName = scriptTag.getAttribute('data-custom-function-name');

  const pollingResourceSrc = window.location.href;
  let currentMainScript = getMainScript(window.document)

  subscribeToActivityEvents();

  const intervalId = setInterval(async () => {
    if (getToastElement()) {
      return;
    }

    if (!isUserActive) {
      return;
    }

    isUserActive = false;
    
    if(customFunctionName) {
      return await handleCustomFunction();
    }

    xhttp.open('GET', pollingResourceSrc);
    xhttp.send();


  }, pollingIntervalInMinutes * MINUTE_IN_MS);
})();


