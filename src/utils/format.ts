export const formatCode = (value: string) => value.replaceAll("_", " ");

export const labelize = (value: string) =>
  value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
