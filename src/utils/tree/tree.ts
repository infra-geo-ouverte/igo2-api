export abstract class Tree<T> {
  private _data: T[];

  get data() {
    return this._data;
  }

  constructor(initialData?: T[]) {
    this._data = initialData;
  }

  abstract isAncestor(node: T): boolean;

  abstract getAncestorId(node: T): string;

  abstract getLevel(node: T): number;

  abstract getChildren(node: T): T[] | undefined | null;

  abstract getId(node: T): string;

  abstract setChildren(node: T, value: T[]): void;

  fromFlatList(data: T[]): Tree<T> {
    this._data = this.buildTree(data);
    return this;
  }

  private buildTree(data: T[]): T[] {
    return data
      .sort((a, b) => this.compareLevel(a, b))
      .reduce((tree, node) => {
        let ancestorTree = tree;
        const ancestorId = this.getAncestorId(node);
        if (ancestorId) {
          const nodeAncestor = this.getNodeById(ancestorId, tree);
          if (nodeAncestor) {
            ancestorTree = this.getChildren(nodeAncestor);
          }
        }

        if (this.isAncestor(node)) {
          // Init node capability to receive children
          this.setChildren(node, []);
        }
        ancestorTree.push(node);
        return tree;
      }, []);
  }

  /** Recursive */
  private getNodeById(id: string, data: T[]): T {
    let node: T;
    data.some((item) => {
      if (this.getId(item) === id) {
        node = item;
        return true;
      }

      const children = this.getChildren(item);
      if (children) {
        node = this.getNodeById(id, children);
        if (node) {
          return true;
        }
      }

      return false;
    });
    return node;
  }

  private compareLevel(a: T, b: T): number {
    return this.getLevel(a) - this.getLevel(b);
  }
}
