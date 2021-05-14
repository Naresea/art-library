export interface TaggedElem<T> {
  payload: T;
  tags: Array<string>;
}

export interface TagGuessElem<T> {
  name: string;
  payload: T
}
