export const makeCancelable = (promise) => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      val => hasCanceled_ ? reject({isCanceled: true}) : resolve(val),
      error => hasCanceled_ ? reject({isCanceled: true}) : reject(error)
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
};

export function appendPendingPromise(promise) {
  this.pendingPromises = [...this.pendingPromises, promise];
}

export function removePendingPromise(promise) {
  this.pendingPromises = this.pendingPromises.filter(p => p !== promise);
}
