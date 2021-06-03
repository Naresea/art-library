export const enum TransferState {
  PENDING,
  PROGRESS,
  DONE
}

export interface Transfer<T> {
  progress: number;
  state: TransferState;
  result?: T;
}

export interface ProgressReport {
  total: number;
  success: number;
  failed: number;
}
