export function classes(...classes: string[]): string {
  let result = "";
  for (let i = 0; i < classes.length; i++) {
    result += classes[i] + " ";
  }
  return result.trim()
}