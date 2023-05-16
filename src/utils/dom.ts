export const inBrowser = typeof window !== "undefined"

export function documentReady(passThrough?: any) {
  return new Promise(resolve => {
    if (document.readyState === "complete") {
      resolve(passThrough)
    } else {
      document.addEventListener("DOMContentLoaded", () => resolve(passThrough))
    }
  })
}
