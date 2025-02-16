export class TraceablePromise<T> extends Promise<T> {
    private readonly __creationPoint: string | undefined;
    constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
        super(executor);
        this.__creationPoint = new Error().stack;
    }
    get creationPoint(): string | undefined {
        return this.__creationPoint;
    }
}
