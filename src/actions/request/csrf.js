export class CSRF {
  static get() {
    const token = document.querySelector('meta[name="csrf-token"]')?.content;

    return token ? token : null;
  }
}
