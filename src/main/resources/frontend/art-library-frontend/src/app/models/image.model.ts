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
  // id might be undefined if tags were changed
  // but entity wasn't refetched from database yet
  id?: number;
  name: string;
}

export interface ImageMetadata {
  id: number;
  name: string;
  title?: string;
  category?: string;
  description?: string;
  type: string;
  tags: Array<ImageTagMetadata>;
}

export interface ImageGalleryData extends ImageMetadata {
  smallUrl: string;
  medUrl: string;
  bigUrl: string;
  rawUrl: string;
}

export interface ImageMetadataUpdate {
  id: number;
  title?: string;
  category?: string;
  description?: string;
  tags?: Array<string>;
}

export const enum ImageSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  BIG = 'big',
  ORIGINAL = 'raw'
}

export enum QueryMethod {
  HAS_ONE_OF = 'any',
  HAS_ALL_OF = 'all',
  HAS_EXACTLY = 'exact'
}

export enum ImageCategory {
  TOKEN = 'token',
  BATTLEMAP = 'battlemap',
  ARTWORK = 'artwork'
}
