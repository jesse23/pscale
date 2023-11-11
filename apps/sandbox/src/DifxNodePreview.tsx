import { Allotment } from 'allotment';
import DifxTree from './DifxTree';
import DifxTable from './DifxTable';
import { useCallback, useEffect, useState } from 'react';
import { PreviewObjectTreeNode } from './types';
import { toPreviewNodeList } from '@pscale/difx';

const updateIdxAndLevel = (
  nodes: PreviewObjectTreeNode[],
  ctx = {
    idx: 0,
    level: -1,
  }
): PreviewObjectTreeNode[] => {
  ctx.level++;
  const res = nodes.map((node) => ({
    ...node,
    idx: ctx.idx++,
    level: ctx.level,
    ...(node.sub
      ? {
          sub: updateIdxAndLevel(
            node.sub as PreviewObjectTreeNode[],
            ctx,
          ),
        }
      : {}),
  }));
  ctx.level--;
  return res;
};

export default function DifxNodePreview({
  changeContents,
}: {
  changeContents: string;
}) {
  const [data, setData] = useState<PreviewObjectTreeNode[]>([]);
  const [selected, setSelected] = useState({} as PreviewObjectTreeNode);

  const toggleSelection = useCallback(
    (node: PreviewObjectTreeNode) => {
      setSelected((prev) => {
        if (prev.idx === node.idx) {
          return {} as PreviewObjectTreeNode;
        } else {
          return node;
        }
      });
    },
    [setSelected]
  );

  useEffect(() => {
    setData(
      updateIdxAndLevel(
        toPreviewNodeList(JSON.parse(changeContents), {
          tag: 'groups',
          name: 'name',
        })
      )
    );
  }, [changeContents]);

  return (
    <Allotment defaultSizes={[100, 100]}>
      <Allotment.Pane>
        <DifxTree data={data} selected={selected} onSelect={toggleSelection} />
      </Allotment.Pane>
      <Allotment.Pane snap>
        <DifxTable item={selected} />
      </Allotment.Pane>
    </Allotment>
  );
}
