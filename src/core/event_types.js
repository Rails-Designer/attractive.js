class EventTypes {
  identify({ by: value }) {
    const actions = value.split(" ");

    return actions
    .filter(action => action.includes("->"))
    .map(action => {
      const [event] = action.split("->");

      return this.#parse(event);
    });
    // return actions
    //   .filter(action => action.includes("->"))
    //   .map(action => action.split("->")[0]);
  }

  getDefault({ from: element }) {
    const tagName = element.tagName.toLowerCase();

    const isInput = tagName === "input";
    const inputType = isInput ? (element.type || "text") : null;

    // return isInput
    //   ? (this.#defaultEvents.input[inputType] || this.#defaultEvents.input.default)
    //   : (this.#defaultEvents[tagName] || this.#defaultEvents.default);
    return {
      name: isInput
        ? (this.#defaultEvents.input[inputType] || this.#defaultEvents.input.default)
        : (this.#defaultEvents[tagName] || this.#defaultEvents.default),
      target: element
    };
  }

  // private

  #parse(rawEvent) {
    if (rawEvent.includes("@")) {
      const [target, name] = rawEvent.split("@");

      return {
        name,
        target: target === "window" ? window : (target === "document" ? document : null)
      };
    }

    return {
      name: rawEvent,
      target: null
    };
  }

  #defaultEvents = {
    "a": "click",
    "button": "click",
    "input": {
      "checkbox": "change",
      "radio": "change",
      "submit": "click",
      "button": "click",
      "reset": "click",
      "default": "input"
    },
    "select": "change",
    "textarea": "input",
    "form": "submit",
    "default": "click"
  };
}

export default new EventTypes();
