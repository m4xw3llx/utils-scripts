class BinarySearchTree {
  constructor() {
    this.root = null;
    this.level = 0;
  }

  Node(key) {
    let left = null;
    let right = null;
    return {
      key,
      left,
      right
    };
  }

  insert(key) {
    let newNode = this.Node(key);
    if (this.root === null) {
      this.root = newNode;
    } else {
      this.insertNode(this.root, newNode);
    }
  }

  insertNode(node, newNode) {
    this.level++;
    if (newNode.key < node.key) {
      if (node.left === null) {
        node.left = newNode;
      } else {
        this.insertNode(node.left, newNode);
      }
    } else {
      if (node.right === null) {
        node.right = newNode;
      } else {
        this.insertNode(node.right, newNode);
      }
    }
  }

  inOrderTraverse() {
    let result = this.inOrderTraverseNode(this.root);
    console.log("result is :", result);
  }

  inOrderTraverseNode(node) {
    let leftResult = [];
    let rightResult = [];

    if (node.left) {
      leftResult = this.inOrderTraverseNode(node.left);
    }
    if (node.right) {
      rightResult = this.inOrderTraverseNode(node.right);
    }

    const result = [node.key].concat(leftResult).concat(rightResult);
    return result;
  }

  min() {
    console.log(this.minNode(this.root));
  }

  max() {
    console.log(this.maxNode(this.root));
  }

  minNode(node) {
    let minValue = null;
    if (node.left) {
      minValue = this.minNode(node.left);
    } else if (node.right) {
      minValue = this.minNode(node.right);
    } else {
      minValue = node.key;
    }
    return minValue;
  }

  maxNode(node) {
    let maxValue = null;
    if (node.right) {
      maxValue = this.maxNode(node.right);
    } else if (node.left) {
      maxValue = this.maxNode(node.left);
    } else {
      maxValue = node.key;
    }
    return maxValue;
  }

  exchange() {
    console.log("Node after exchange is ", this.exchangeNode(this.root));
  }

  exchangeNode(node) {
    if (!node || (!node.left && !node.right)) {
      return node;
    } else {
      let exchangedLeft = this.exchangeNode(node.left);
      let exchangedRight = this.exchangeNode(node.right);

      let newNode = this.Node(node.key);
      newNode.left = exchangedRight;
      newNode.right = exchangedLeft;
      return newNode;
    }
  }
}

let m = new BinarySearchTree();
m.insert(5);
m.insert(4);
m.insert(3);
m.insert(6);
m.insert(7);

console.log(m);
m.inOrderTraverse();
// m.min()
// m.max()
m.exchange();
m.inOrderTraverse();
