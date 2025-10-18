import Events from "./core/events";
import EventTypes from "./core/event_types";
import Observer from "./core/observer";
import actions, { availableActions } from "./actions";
import Debug from "./debug";

class Attractive {
  #eventListeners = {};
  #events;
  #observe;
  #onLoadActions = ["scrollTo", "intersect-once", "intersect-toggle"];

  static get debug() {
    return Debug.enabled;
  }

  static set debug(value) {
    Debug.enabled = value;
  }

  constructor() {
    this.#events = new Events(actions);
    this.#observe = new Observer(element => this.#prepare(element));
  }

  activate(options = {}) {
    const { on = document, debug = false } = options;

    Debug.enabled = debug;
    Debug.log("Initializing…");

    this.element = on;
    this.#observe.start("[data-action]");
    this.element.querySelectorAll("[data-action]").forEach(element => this.#prepare(element));

    Debug.log("…initialized");

    return this;
  }

  withActions(actions = []) {
    Debug.log("Initializing with actions", actions);

    this.#events = new Events(availableActions(actions));

    return this;
  }

  // private

  #prepare(element) {
    const actionValue = element.dataset.action;

    if (!actionValue) return;

    const actions = actionValue.split(" ");
    const onLoadActions = actions.filter(action => this.#onLoadActions.includes(action.split("#")[0]));

    if (onLoadActions.length > 0) {
      onLoadActions.forEach(action => this.#onLoadExecute({ action, on: element }));

      return;
    }

    const registeredEventTypes = new Set(
      actionValue.includes("->")
        ? EventTypes.identify({ by: actionValue })
        : [EventTypes.getDefault({ from: element })]
    );

    registeredEventTypes.forEach(event => this.#addEventListeners({ for: event }));
  }

  #addEventListeners({ for: eventType }) {
    const { name, target } = eventType;
    const listenerTarget = target || this.element;
    const listenerKey = `${name}@${target ? (target === window ? 'window' : 'document') : 'element'}`;

    if (this.#eventListeners[listenerKey]) return;

    listenerTarget.addEventListener(name, (event) => this.#process(event));

    Debug.log("Added event listener for", name, "to", listenerTarget);

    this.#eventListeners[listenerKey] = true;
  }

  #process(event) {
    // Yikes!
    if (event.currentTarget === window || event.currentTarget === document) {
      const eventName = event.type;
      this.element.querySelectorAll("[data-action]").forEach(element => {
        const actionValue = element.dataset.action;
        if (actionValue?.includes(`${event.currentTarget === window ? 'window' : 'document'}@${eventName}->`)) {
          const defaultEventType = EventTypes.getDefault({ from: element });
          this.#events.process(event, { on: element, using: defaultEventType });
        }
      });
      return;
    }

    const element = event.target.closest("[data-action]");

    if (!element) return;

    const defaultEventType = EventTypes.getDefault({ from: element });

    this.#events.process(event, { on: element, using: defaultEventType });
  }


  #onLoadExecute({ action, on: element }) {
    const [actionName, ...valueParts] = action.split("#");

    if (typeof actions[actionName] !== "function") return;

    const value = valueParts.length > 0 ? valueParts.join("#") : null;
    const targetElement = element.dataset.target;

    actions[actionName](element, { value, targetElement });
  }
}

export default new Attractive();
