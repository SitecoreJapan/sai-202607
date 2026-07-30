export function register() {
 // if (process.env.NEXT_RUNTIME === 'nodejs') {
    const originalSort = Array.prototype.sort;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Array.prototype.sort = function (...args: any[]) {
      if (Object.isFrozen(this)) {
        // React 19 freezes props/state arrays in production. Dependencies (e.g. Next.js <Image>)
        // may call .sort() on these frozen arrays. Return a sorted copy to avoid the TypeError.
        return originalSort.apply([...this], args);
      }
      return originalSort.apply(this, args);
    };
 // }
}