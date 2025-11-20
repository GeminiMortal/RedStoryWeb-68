
    interface CleanupResult {
      deletedCount: number;
      message?: string;
      error?: string;
    }

    export declare function main(event: any, context: any): Promise<CleanupResult>;
  