export class Queue<T> {

    private queue: T[] = [];

    public add(item: T): void {
        this.queue.push(item);
    }

    public peek(): T {
        return this.queue.length > 0 ? this.queue[0] : null;
    }

    public next(): T {
        return this.queue.shift();
    }

    public clear(): void {
        this.queue = [];
    }

    public isEmpty(): boolean {
        return this.queue.length <= 0;
    }

    public toString() {
        return `queue items: [ ${this.queue.join(", ")} ]`;
    }
}