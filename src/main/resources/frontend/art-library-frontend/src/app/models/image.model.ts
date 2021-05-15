export interface Page<T> {
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
  content: Array<T>;
}

export interface ImageTagMetadata {
  id: number;
  name: string;
}

export interface ImageMetadata {
  id: number;
  name: string;
  type: string;
  tags: Array<ImageTagMetadata>;
}

export const enum ImageSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  BIG = 'big',
  ORIGINAL = 'raw'
}

export const enum QueryMethod {
  HAS_ONE_OF = 'any',
  HAS_ALL_OF = 'all',
  HAS_EXACTLY = 'exact'
}
