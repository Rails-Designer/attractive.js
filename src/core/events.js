import Debug from "./../debug";

class Events {
  #actions;

  constructor(actions) {
    Debug.log("Events with actions:", Object.keys(actions));

    this.#actions = actions;
  }

  process(event, { on: element, using: defaultEventType }) {
    if (!element) return;

    const actions = this.#splitActions(element.dataset.action);

    actions.forEach(action => this.#evaluate(action, { for: event, on: element, using: defaultEventType }));
  }

  // private

  #splitActions(action) {
    const result = [];
    let currentAction = '';
    let inBackticks = false;

    [...action].forEach(character => {
      if (character === "`") return inBackticks = !inBackticks;
      if (character === " " && !inBackticks) return currentAction && (result.push(currentAction), currentAction = "");

      currentAction += character;
    });

    if (currentAction) result.push(currentAction);

    return result;
  }

  #evaluate(action, { for: event, on: element, using: defaultEventType }) {
    if (action.includes("->")) {
      const [eventDescriptor, actionPart] = action.split("->");
      const eventName = eventDescriptor.includes("@") ? eventDescriptor.split("@")[1] : eventDescriptor;

      if (eventName !== event.type) return;

      this.#execute(actionPart, { on: element });
    } else if (event.type === (defaultEventType.name || defaultEventType)) {
      this.#execute(action, { on: element });
    }
  }

  #execute(action, { on: element }) {
    Debug.log("Execute action", action, "on", element, "…");

    const parts = action.split("#");
    const [possibleAction, fallbackAction, fallbackValue] = parts;

    const actionName = this.#actions[possibleAction] ? possibleAction : (fallbackAction ?? action);
    const value = this.#actions[possibleAction] ? parts.slice(1).join("#") : (fallbackValue ?? null);

    if (typeof this.#actions[actionName] !== "function") return;

    this.#actions[actionName](element, {
      value,
      targetElement: element.dataset.target
    });

    Debug.log("…", "executed action", action, "on", element);
  }
}

export default Events;
