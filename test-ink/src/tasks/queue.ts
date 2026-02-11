/**
 * Task Queue Module
 * 
 * Implements a priority-based task queue for managing queued tasks.
 * Tasks are ordered by priority, with higher priority tasks executed first.
 */

import type { Task, TaskPriority } from './types.js';

/**
 * Priority queue node for internal storage
 */
interface QueueNode<T = unknown> {
  task: Task<T>;
  priority: TaskPriority;
  insertionOrder: number;
}

/**
 * TaskQueue class for managing queued tasks with priority ordering
 */
export class TaskQueue<T = unknown> {
  private queue: QueueNode<T>[] = [];
  private taskMap: Map<string, QueueNode<T>> = new Map();
  private insertionCounter: number = 0;

  /**
   * Creates a new TaskQueue instance
   */
  constructor() {
    this.queue = [];
    this.taskMap = new Map();
    this.insertionCounter = 0;
  }

  /**
   * Adds a task to the queue
   * @param task - The task to enqueue
   * @returns The number of tasks in the queue after enqueuing
   */
  enqueue(task: Task<T>): number {
    const node: QueueNode<T> = {
      task,
      priority: task.priority,
      insertionOrder: this.insertionCounter++,
    };

    this.queue.push(node);
    this.taskMap.set(task.id, node);
    this.heapifyUp(this.queue.length - 1);

    return this.queue.length;
  }

  /**
   * Removes and returns the highest priority task from the queue
   * @returns The highest priority task, or undefined if queue is empty
   */
  dequeue(): Task<T> | undefined {
    if (this.queue.length === 0) {
      return undefined;
    }

    const node = this.queue[0];
    const lastNode = this.queue.pop()!;

    if (this.queue.length > 0) {
      this.queue[0] = lastNode;
      this.heapifyDown(0);
    }

    this.taskMap.delete(node.task.id);
    return node.task;
  }

  /**
   * Returns the highest priority task without removing it
   * @returns The highest priority task, or undefined if queue is empty
   */
  peek(): Task<T> | undefined {
    return this.queue.length > 0 ? this.queue[0].task : undefined;
  }

  /**
   * Returns the number of tasks in the queue
   * @returns The queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Checks if the queue is empty
   * @returns True if queue is empty, false otherwise
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Removes all tasks from the queue
   */
  clear(): void {
    this.queue = [];
    this.taskMap.clear();
    this.insertionCounter = 0;
  }

  /**
   * Checks if a task with the given ID is in the queue
   * @param taskId - The task ID to check
   * @returns True if task is in queue, false otherwise
   */
  has(taskId: string): boolean {
    return this.taskMap.has(taskId);
  }

  /**
   * Removes a specific task from the queue
   * @param taskId - The ID of the task to remove
   * @returns The removed task, or undefined if not found
   */
  remove(taskId: string): Task<T> | undefined {
    const node = this.taskMap.get(taskId);
    if (!node) {
      return undefined;
    }

    const index = this.queue.indexOf(node);
    if (index === -1) {
      return undefined;
    }

    const lastNode = this.queue.pop()!;
    this.taskMap.delete(taskId);

    if (index < this.queue.length) {
      this.queue[index] = lastNode;
      this.heapifyUp(index);
      this.heapifyDown(index);
    }

    return node.task;
  }

  /**
   * Returns all tasks in the queue (in priority order)
   * @returns Array of tasks in priority order
   */
  toArray(): Task<T>[] {
    return this.queue.map((node) => node.task);
  }

  /**
   * Returns tasks filtered by priority
   * @param priority - The priority level to filter by
   * @returns Array of tasks with the specified priority
   */
  getByPriority(priority: TaskPriority): Task<T>[] {
    return this.queue
      .filter((node) => node.priority === priority)
      .map((node) => node.task);
  }

  /**
   * Returns tasks that have all their dependencies satisfied
   * @param completedTaskIds - Set of completed task IDs
   * @returns Array of tasks with satisfied dependencies
   */
  getReadyTasks(completedTaskIds: Set<string>): Task<T>[] {
    return this.queue
      .filter((node) => {
        const dependencies = node.task.dependencies;
        if (dependencies.length === 0) {
          return true;
        }
        return dependencies.every((depId) => completedTaskIds.has(depId));
      })
      .map((node) => node.task);
  }

  /**
   * Moves a task up in the heap to maintain heap property
   * @param index - The index of the node to move up
   */
  private heapifyUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(index, parentIndex) <= 0) {
        break;
      }
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  /**
   * Moves a task down in the heap to maintain heap property
   * @param index - The index of the node to move down
   */
  private heapifyDown(index: number): void {
    const length = this.queue.length;
    while (true) {
      let largest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && this.compare(leftChild, largest) > 0) {
        largest = leftChild;
      }
      if (rightChild < length && this.compare(rightChild, largest) > 0) {
        largest = rightChild;
      }

      if (largest === index) {
        break;
      }

      this.swap(index, largest);
      index = largest;
    }
  }

  /**
   * Compares two nodes by priority and insertion order
   * @param index1 - First node index
   * @param index2 - Second node index
   * @returns Positive if first has higher priority, negative if lower, zero if equal
   */
  private compare(index1: number, index2: number): number {
    const node1 = this.queue[index1];
    const node2 = this.queue[index2];

    if (node1.priority !== node2.priority) {
      return node1.priority - node2.priority;
    }

    // FIFO for same priority
    return node2.insertionOrder - node1.insertionOrder;
  }

  /**
   * Swaps two nodes in the queue
   * @param index1 - First node index
   * @param index2 - Second node index
   */
  private swap(index1: number, index2: number): void {
    const temp = this.queue[index1];
    this.queue[index1] = this.queue[index2];
    this.queue[index2] = temp;
  }
}
