export class Queue<T> {
    private queue: T[] = [];

    public add(item: T): void {
        this.queue.push(item);
    }

    public addSecondFromTop(item: T): void {
        const top = this.peek();

        this.removeAt(0);
        this.queue.reverse();
        this.queue.push(item);
        this.queue.push(top);
        this.queue.reverse();
    }

    public peek(): T {
        return this.queue.length > 0 ? this.queue[0] : undefined;
    }

    public shift(): T {
        return this.queue.shift();
    }

    public clear(): void {
        this.queue = [];
    }

    public isEmpty(): boolean {
        return this.queue.length <= 0;
    }

    public getQueue(): T[] {
        return this.queue;
    }

    public removeAt(index: number): T {
        return this.queue.splice(index, 1)[0];
    }

    public toString() {
        return `queue items: [ ${this.queue.join(", ")} ]`;
    }
}