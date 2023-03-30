"use strict";

class Refresher {
	static SECOND_IN_MS = 1000;
	static MINUTE_IN_MS = 60 * Refresher.SECOND_IN_MS;
	static DOM_ELEMENT_ID = "refresher-js-toast";
	static SCRIPT_TAG_ID = "refresher-js-script";
	static OPEN_TOAST_EVENT_NAME = "refresher-js-open-toast";

	static ANGULAR_AND_REACT_MAIN_SCRIPT_PREFIX = "main.";
	static ANGULAR_LAZY_LOADING_SCRIPT_PREFIX = "runtime.";
	static VUE_V3_MAIN_SCRIPT_PREFIX = "index.";
	static VUE_V2_MAIN_SCRIPT_PREFIX = "app.";
	static DEFAULTS = {
		PRIMARY_COLOR: "#004dff",
		TITLE_TEXT: "New version is available",
		SUBTITLE_TEXT: "Please refresh the page",
		REFRESH_BUTTON_TEXT: "Refresh",
		POLLING_INTERVAL_IN_MINUTES: 120,
	};
	static configuration = {
		pollingIntervalInMinutes: undefined,
		titleText: undefined,
		subTitleText: undefined,
		primaryColor: undefined,
		refreshButtonText: undefined,
		disableToast: undefined,
		customFunctionName: undefined,
	};

	static isUserActive = false;

	static refresh() {
		location.reload();
	}

	static closeToast = () => {
		const toastElement = Refresher.getToastElement();

		toastElement.classList.remove("opened");
		setTimeout(() => {
			toastElement.remove();
		}, Refresher.SECOND_IN_MS);
		Refresher.openToastLater();
	};

	static createToastElement = () => {
		const toastDiv = document.createElement("div");

		toastDiv.id = Refresher.DOM_ELEMENT_ID;

		const htmlTemplate = `
                          <svg class="close-btn" viewPort="0 0 12 12" version="1.1"
                                              xmlns="http://www.w3.org/2000/svg" onclick="Refresher.closeToast()">
                                              <line x1="1" y1="11"
                                                    x2="11" y2="1"
                                                    stroke="black"
                                                    stroke-width="2"/>
                                              <line x1="1" y1="1"
                                                    x2="11" y2="11"
                                                    stroke="black"
                                                    stroke-width="2"/>
                            </svg>
                        <h2>${Refresher.configuration.titleText}</h2>
                        <p>${Refresher.configuration.subTitleText}</p>
                        <div class="buttons">
                          <button class="refresh" onclick="Refresher.refresh()">${Refresher.configuration.refreshButtonText}</button>

                `;

		toastDiv.innerHTML = htmlTemplate;

		document.body.appendChild(toastDiv);
		Refresher.appendCustomCss(toastDiv);

		return toastDiv;
	};

	static appendCustomCss = (element) => {
		const style = document.createElement("style");

		element.appendChild(style);
		style.innerHTML = `
  #${Refresher.DOM_ELEMENT_ID} {
    position: fixed;
    display: block;
    z-index: 101;
    min-width: 150px;
    bottom: 0;
    left: 20px;
    padding: 20px;
    border-radius: 5px;
    background: #ffffffd1;
    box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
    transition: 0.3s transform;
    border: 1px solid #efefef;
    border-left: 5px solid ${Refresher.configuration.primaryColor};
    transform: translate(0, 100%);
    backdrop-filter: blur(10px);
    font-weight: lighter;
  }

  #${Refresher.DOM_ELEMENT_ID}.opened {
    transform: translate(0, -15%);
  }

  #${Refresher.DOM_ELEMENT_ID} .close-btn {
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

  #${Refresher.DOM_ELEMENT_ID} .close-btn:hover {
    opacity: 1;
  }

  #${Refresher.DOM_ELEMENT_ID} .buttons {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  #${Refresher.DOM_ELEMENT_ID} button {
    border-width: 0;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    outline: none;
    transition: filter 0.3s;
  }

  #${Refresher.DOM_ELEMENT_ID} button.refresh {
    color: #fff;
    background-color: ${Refresher.configuration.primaryColor};
    filter: saturate(0.8);
  }

  #${Refresher.DOM_ELEMENT_ID} button.refresh:hover {
    filter: saturate(1)
  }

  #${Refresher.DOM_ELEMENT_ID} h2 {
    font-weight: lighter;
    margin: 0;
    padding-right: 40px;
  }

  #${Refresher.DOM_ELEMENT_ID} p {
        margin: 0;
        margin-top: 10px;
        opacity: 0.8;
  }

  `;
	};

	static openToastLater = () => {
		setTimeout(() => {
			Refresher.openToast();
		}, Refresher.configuration.pollingIntervalInMinutes * Refresher.MINUTE_IN_MS);
	};

	static openToast = () => {
		Refresher.dispatchOpenToastEvent();

		if (Refresher.getToastElement()) {
			return;
		}

		if (Refresher.configuration.disableToast) {
			return;
		}

		const toastElement = Refresher.createToastElement();

		setTimeout(() => {
			toastElement.classList.add("opened");
		}, Refresher.SECOND_IN_MS);
	};

	static getToastElement = () => {
		return document.getElementById(Refresher.DOM_ELEMENT_ID);
	};

	static dispatchOpenToastEvent = () => {
		document.dispatchEvent(new Event(Refresher.OPEN_TOAST_EVENT_NAME));
	};

	static getMainScript = (doc) => {
		const scripts = [...doc.getElementsByTagName("script")];
		const mainScript = scripts.filter((script) =>
			script?.src?.includes(Refresher.ANGULAR_AND_REACT_MAIN_SCRIPT_PREFIX)
		)?.[0];

		if (!mainScript) {
			const vueScript = scripts.filter(
				(script) =>
					script?.src?.includes(Refresher.VUE_V2_MAIN_SCRIPT_PREFIX) ||
					script?.src?.includes(Refresher.VUE_V3_MAIN_SCRIPT_PREFIX)
			)?.[0];
			return vueScript?.src;
		}
		const polyfillsScriptName =
			scripts.filter((script) => script?.src?.includes(Refresher.ANGULAR_LAZY_LOADING_SCRIPT_PREFIX))?.[0]?.src ?? "";
		const mainScriptName = mainScript?.src;

		return mainScriptName + polyfillsScriptName;
	};

	static getRefresherScriptTag = () => {
		return document.getElementById(Refresher.SCRIPT_TAG_ID);
	};

	static handleCustomFunction = async () => {
		const customFunctionRes = await window[customFunctionName]();
		if (customFunctionRes) {
			Refresher.openToast();
			clearInterval(intervalId);
		}
		return;
	};

	static subscribeToActivityEvents = () => {
		document.onvisibilitychange = () => {
			if (document.visibilityState === "visible") {
				Refresher.isUserActive = true;
			}
		};

		onclick = () => {
			Refresher.isUserActive = true;
		};
	};

	static init() {
		const xhttp = new XMLHttpRequest();

		xhttp.onload = (data) => {
			const doc = new DOMParser().parseFromString(data.target.response, "text/html");

			const nextMainScript = Refresher.getMainScript(doc);
			if (currentMainScript !== nextMainScript) {
				Refresher.openToast();
				clearInterval(intervalId);
				currentMainScript = nextMainScript;
			}
		};
		const scriptTag = Refresher.getRefresherScriptTag();
		const { DEFAULTS } = Refresher;
		Refresher.configuration.pollingIntervalInMinutes =
			Number(scriptTag.getAttribute("data-polling-interval-in-minutes")) ?? DEFAULTS.POLLING_INTERVAL_IN_MINUTES;
		Refresher.configuration.titleText = scriptTag.getAttribute("data-title-text") ?? DEFAULTS.TITLE_TEXT;
		Refresher.configuration.subTitleText = scriptTag.getAttribute("data-subtitle-text") ?? DEFAULTS.SUBTITLE_TEXT;
		Refresher.configuration.primaryColor = scriptTag.getAttribute("data-primary-color") ?? DEFAULTS.PRIMARY_COLOR;
		Refresher.configuration.refreshButtonText =
			scriptTag.getAttribute("data-refresh-button-text") ?? DEFAULTS.REFRESH_BUTTON_TEXT;
		Refresher.configuration.disableToast = scriptTag.getAttribute("data-disable-toast") === "true";
		Refresher.configuration.customFunctionName = scriptTag.getAttribute("data-custom-function-name");

		const pollingResourceSrc = window.location.href;
		let currentMainScript = Refresher.getMainScript(window.document);

		Refresher.subscribeToActivityEvents();

		Refresher.openToast();

		const intervalId = setInterval(async () => {
			if (Refresher.getToastElement()) {
				return;
			}

			if (!Refresher.isUserActive) {
				return;
			}

			Refresher.isUserActive = false;

			if (Refresher.configuration.customFunctionName) {
				return await Refresher.handleCustomFunction();
			}

			xhttp.open("GET", pollingResourceSrc);
			xhttp.send();
		}, Refresher.configuration.pollingIntervalInMinutes * Refresher.MINUTE_IN_MS);
	}
}

Refresher.init();
