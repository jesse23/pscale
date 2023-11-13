import { Allotment } from 'allotment';
import { CodeEditor } from './CodeEditor';
import { useEffect, useState } from 'react';
import { diff, apply, view, ViewNode } from '@pscale/difx';
import { evalExpression } from '@pscale/util';
import styles from './View.module.css';
import 'allotment/dist/style.css';
import DifxNodeViewPanel from './DifxNodeViewPanel';

const EXAMPLE = {
  xml: {},
  json: {
    source: [
      `
[
  {
    id: 'id1',
    name: 'group1',
    users: [
      { id: 'id11', name: 'user11' },
      {
        desc: 'external user',
        name: 'user12',
        id: 'id12',
        external: true,
        role: {
          id: 'admin',
          name: 'external owner',
        },
      },
      { id: 'id13', name: 'user13' },
    ],
  },
  {
    id: 'id2',
    name: 'group2',
    users: [
      { id: 'id21', name: 'user21' },
      { id: 'id22', name: 'user22' },
    ],
  },
]
    `,
    ],
    target: [
      `
[
  {
    id: 'id1',
    name: 'group1_new',
    users: [
      {
        id: 'id12',
        name: 'user12_new',
        desc: 'external user',
        modifiable: true,
        role: {
          id: 'admin',
          name: 'administrator',
        },
      },
      { id: 'id11', name: 'user11' },
      { id: 'id14', name: 'user14' },
    ], 
  },
  {
    id: 'id3',
    name: 'group3',
    users: [{ id: 'id31', name: 'user31' }],
  },
]
    `,
    ],
    destination: [
      `
[
  {
    id: 'id1',
    name: 'group1',
    users: [
      { id: 'id11', name: 'user11' },
      {
        desc: 'external user',
        name: 'user12',
        id: 'id12',
        external: true,
        role: {
          id: 'admin',
          name: 'external owner',
        },
      },
      { id: 'id13', name: 'user13' },
    ],
  },
  {
    id: 'id2',
    name: 'group2',
    users: [
      { id: 'id21', name: 'user21' },
      { id: 'id22', name: 'user22' },
    ],
  },
]
    `,
    ],
  },
};

export default function DifxJsonMergeView() {
  // source
  const [src, setSrc] = useState(EXAMPLE.json.source.join('\n').trim());
  const [tar, setTar] = useState(EXAMPLE.json.target.join('\n').trim());
  const [dest, setDest] = useState(EXAMPLE.json.destination.join('\n').trim());
  const [viewNodes, setViewNodes] = useState([] as ViewNode[]);
  const [result, setResult] = useState('/* result */');

  useEffect(() => {
    try {
      const srcData = evalExpression(src) as Record<string, unknown>;
      const tarData = evalExpression(tar) as Record<string, unknown>;
      const destData = evalExpression(dest) as Record<string, unknown>;
      const opts = { reorder: true, key: 'id', defaultTag: '', name: 'name' };
      // for object without key id
      // const opts = { reorder: true, key: 'name', defaultTag: '', name: 'name' };
      const patch = diff(srcData, tarData, opts);
      const nodes = view(destData, patch, opts);
      const final = apply(destData, patch, opts);
      setViewNodes(() => nodes);
      setResult(() => JSON.stringify(final, null, 2));
    } catch (e) {
      setResult((e as Error).stack || '');
      // throw e;
    }
  }, [src, tar, dest]);

  return (
    <div className={styles.container}>
        <Allotment vertical  defaultSizes={[75, 100]}>
          <Allotment.Pane minSize={100}>
            <Allotment defaultSizes={[100, 100, 100]}>
              <Allotment.Pane>
                <CodeEditor code={src} type="js" onChange={setSrc} />
              </Allotment.Pane>
              <Allotment.Pane>
                <CodeEditor code={tar} type="js" onChange={setTar} />
              </Allotment.Pane>
              <Allotment.Pane>
                <CodeEditor code={dest} type="js" onChange={setDest} />
              </Allotment.Pane>
            </Allotment>
          </Allotment.Pane>
          <Allotment.Pane snap>
            <Allotment defaultSizes={[200, 100]}>
              <Allotment.Pane>
                <DifxNodeViewPanel nodes={viewNodes} />
              </Allotment.Pane>
              <Allotment.Pane>
                <CodeEditor code={result} type="js" onChange={setResult} />
              </Allotment.Pane>
            </Allotment>
          </Allotment.Pane>
        </Allotment>
    </div>
  );
}
