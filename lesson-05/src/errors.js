// An Error that carries an HTTP status code (same as Lesson 4)
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
