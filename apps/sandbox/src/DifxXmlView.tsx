import { Allotment } from 'allotment';
import { CodeEditor } from './CodeEditor';
import { useEffect, useState } from 'react';
import { diff, apply, view, ViewNode } from '@pscale/difx';
import styles from './View.module.css';
import 'allotment/dist/style.css';
import DifxNodeViewPanel from './DifxNodeViewPanel';
import { nodeFromXML, nodeToXML } from '@pscale/trmx';
import { isObject } from '@pscale/util';


const EXAMPLE = {
    source: [
      `
<xml>
  <group id="id1" name="group1">
    <user id="id11" name="user11" />
    <user desc="external user" name="user12" id="id12" external="true">
      <role id="admin" name="external owner" />
    </user>
    <user id="id13" name="user13" />
  </group>
  <group id="id2" name="group2">
    <user id="id21" name="user21" />
    <user id="id22" name="user22" />
  </group>
</xml>
    `,
    ],
    target: [
      `
<xml>
  <group id="id1" name="group1_new">
    <user id="id12" name="user12_new" desc="external user" modifiable="true">
      <role id="admin" name="administrator" />
    </user>
    <user id="id11" name="user11" />
    <user id="id14" name="user14" />
  </group>
  <group id="id3" name="group3">
    <user id="id31" name="user31" />
  </group>
</xml>
    `,
    ],
    destination: [
      `
<xml>
  <group id="id1" name="group1">
    <user id="id11" name="user11" />
    <user desc="external user" name="user12" id="id12" external="true">
      <role id="admin" name="external owner" />
    </user>
    <user id="id13" name="user13" />
  </group>
  <group id="id2" name="group2">
    <user id="id21" name="user21" />
    <user id="id22" name="user22" />
  </group>
</xml>
    `,
    ],
};

export default function DifxXmlView() {
  // source
  const [src, setSrc] = useState(EXAMPLE.source.join('\n').trim());
  const [tar, setTar] = useState(EXAMPLE.target.join('\n').trim());
  const [dest, setDest] = useState(EXAMPLE.destination.join('\n').trim());
  const [viewNodes, setViewNodes] = useState([] as ViewNode[]);
  const [result, setResult] = useState('/* result */');

  useEffect(() => {
    try {
      const srcData = nodeFromXML(src.split('\n'));
      const tarData = nodeFromXML(tar.split('\n'));
      const destData = nodeFromXML(dest.split('\n'));
      const opts = { reorder: true, key: 'id', tag:'__type', defaultTag: 'xml', name: 'name' };
      // option to xml without id and name
      // const opts = { reorder: true, key: '__type', tag:'__type', defaultTag: 'xml', name: '__type' };
      const patch = diff(srcData, tarData, opts);
      const nodes = view(destData, patch, opts);
      setViewNodes(() => nodes);
      const final = apply(destData, patch, opts);
      if(isObject(final)) {
        setResult(() => nodeToXML(final).join('\n'));
      } 
      // setResult(JSON.stringify(final, null, 2));
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
