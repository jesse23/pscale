import { Allotment } from 'allotment';
import DifxTree from './DifxTree';
import DifxTable from './DifxTable';
import { useCallback, useEffect, useState } from 'react';
import { ViewTreeNode } from './types';

const updateIdxAndLevel = (
  nodes: ViewTreeNode[],
  ctx = {
    idx: 0,
    level: -1,
  }
): ViewTreeNode[] => {
  ctx.level++;
  const res = nodes.map((node) => ({
    ...node,
    idx: ctx.idx++,
    level: ctx.level,
    ...(node.sub
      ? {
          sub: updateIdxAndLevel(node.sub, ctx),
        }
      : {}),
  }));
  ctx.level--;
  return res;
};

export default function DifxNodViewPanel({ nodes }: { nodes: ViewTreeNode[] }) {
  const [data, setData] = useState([] as ViewTreeNode[]);
  const [selected, setSelected] = useState({} as ViewTreeNode);

  const toggleSelection = useCallback(
    (node: ViewTreeNode) => {
      setSelected((prev) => {
        if (prev.idx === node.idx) {
          return {} as ViewTreeNode;
        } else {
          return node;
        }
      });
    },
    [setSelected]
  );

  useEffect(() => {
    setData(updateIdxAndLevel(nodes));
  }, [nodes]);

  return (
    <Allotment defaultSizes={[100, 100]}>
      <Allotment.Pane>
        <DifxTree data={data} selected={selected} onSelect={toggleSelection} />
      </Allotment.Pane>
      <Allotment.Pane snap>
        <DifxTable node={selected} />
      </Allotment.Pane>
    </Allotment>
  );
}
