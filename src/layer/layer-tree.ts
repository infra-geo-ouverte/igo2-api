import { TREE_SEPERATOR } from '../utils/tree/tree.utils';
import { Tree } from '../utils/tree/tree';
import { AnyLayerOptionsOut, LayerGroupOptions } from './layer.interface';
import { isLayerGroupOptions } from './layer.utils';

/**
 * The LayerTree allows you to rebuild the layer hierarchy based on it's parentId
 * The Layer parentId property is stored with all parent identifiers ex: '1.2.3'
 * this indicates that the layer is inside group 3 which is in 2 and which is 1
 */
export class LayerTree extends Tree<AnyLayerOptionsOut> {
  constructor(data?: AnyLayerOptionsOut[]) {
    super(data);
  }

  getAncestorId = (node: AnyLayerOptionsOut) => node.parentId?.split(TREE_SEPERATOR).pop();
  getChildren = (node: AnyLayerOptionsOut) => {
    if (!isLayerGroupOptions(node)) {
      return undefined;
    } 
    return node.children as AnyLayerOptionsOut[];
  };
  getId = (node: AnyLayerOptionsOut) => String(node.id);
  getLevel = (node: AnyLayerOptionsOut) => node.parentId?.split(TREE_SEPERATOR).length ?? 0;
  isAncestor = (node: AnyLayerOptionsOut) => node.type === 'group';
  setChildren = (node: LayerGroupOptions & { id: string }, value: AnyLayerOptionsOut[]) => node.children = value;
}
