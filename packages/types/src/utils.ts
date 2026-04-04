// oxlint-disable-next-line typescript/no-explicit-any
export type ParametersWithoutFirst<T extends (...args: any[]) => any> =
  // oxlint-disable-next-line typescript/no-explicit-any
  T extends (first: any, ...rest: infer R) => any ? R : never;
