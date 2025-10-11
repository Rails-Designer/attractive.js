import ActionBase from "./base";
import { CSRF } from "./request/csrf";

class Request extends ActionBase {
    constructor(currentElement, options = {}) {
      super(currentElement, options);

      this.value = options.value;
    }

    get() {
      if (!this.value) {
        console.warn("No URL provided in the action value");

        return;
      }

      return fetch(this.value, { method: "GET" })
        .catch(error => console.error("GET request failed:", error));
    }

    post() {
      return this.#fetch("POST");
    }

    patch() {
      return this.#fetch("PATCH");
    }

    put() {
      return this.#fetch("PUT");
    }

    // private

    #fetch(method) {
      if (!this.value) {
        console.warn("No URL provided in the action value");

        return;
      }

      return fetch(this.value, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": CSRF.get()
        },

        body: JSON.stringify(this.#body)
      })
      .catch(error => console.error(`${method} request failed:`, error));
  }

  get #body() {
    let body = {};

    if (this.#inputField) {
      const key = this.currentElement.name;
      const value = this.currentElement.value;

      body[key] = value;
    }

    return body;
  }

  get #inputField() {
    return this.currentElement instanceof HTMLInputElement ||
      this.currentElement instanceof HTMLSelectElement ||
      this.currentElement instanceof HTMLTextAreaElement &&
      this.currentElement.name
  }
}

export const action = (method) => (element, options = {}) => {
  const instance = new Request(element, options);

  return instance[method]();
};

export default {
  get: action("get"),
  post: action("post"),
  patch: action("patch"),
  put: action("put")
};
