import { Allotment } from 'allotment';
import { CodeEditor } from './components/CodeEditor';
import { useEffect, useState } from 'react';
import { diff, view, ViewNode } from '@pscale/difx';
import styles from './View.module.css';
import 'allotment/dist/style.css';
import DifxNodeViewPanel from './components/DifxNodeViewPanel';
import { nodeFromXML } from '@pscale/trmx';
import { XMLParseOptions } from 'libs/trmx/src/types';

const CONFIG = {
  fromXML: {
    /*
    elem_as: 'attr',
    attr_prefix: '_',
    */
  },
  difx: {
    reorder: true,
    key: 'titleKey',
    tag: '__type',
    name: 'titleKey',
    fuzzy: 0.5,
  },
};

export default function DifxView({
  selectedFile,
}: {
  selectedFile: string;
}) {
  // source
  const [src, setSrc] = useState('');
  const [tar, setTar] = useState('');
  const [viewNodes, setViewNodes] = useState([] as ViewNode[]);

  useEffect(() => {
    const loadData = async () => {
      const srcFileContent = await fetch(
        `/.local/data/src/${selectedFile}`
      ).then((res) => res.text());

      const tarFileContent = await fetch(
        `/.local/data/tar/${selectedFile}`
      ).then((res) => res.text());

      setSrc(srcFileContent);
      setTar(tarFileContent);
    };
    loadData();
  }, [selectedFile]);

  useEffect(() => {
    try {
      const srcData = nodeFromXML(
        src.split('\n'),
        CONFIG.fromXML as XMLParseOptions
      );
      const tarData = nodeFromXML(
        tar.split('\n'),
        CONFIG.fromXML as XMLParseOptions
      );
      const configs = CONFIG.difx;
      // option to xml without id and name
      // const opts = { reorder: true, key: '__type', tag:'__type', name: '__type' };
      const patch = diff(srcData, tarData, configs);
      const nodes = view(srcData, patch, configs);
      setViewNodes(() => nodes);
      // const final = apply(srcData, patch, configs);
    } catch (e) {
      // setResult((e as Error).stack || '');
      // throw e;
      console.error(e);
    }
  }, [src, tar]);

  return (
    <div className={styles.container}>
      <Allotment vertical defaultSizes={[35, 65]}>
        <Allotment.Pane minSize={100}>
          <Allotment defaultSizes={[100, 100, 100]}>
            <Allotment.Pane>
              <CodeEditor code={src} type="js" onChange={setSrc} />
            </Allotment.Pane>
            <Allotment.Pane>
              <CodeEditor code={tar} type="js" onChange={setTar} />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
        <Allotment.Pane snap>
          <Allotment defaultSizes={[200, 100]}>
            <Allotment.Pane>
              <DifxNodeViewPanel nodes={viewNodes} />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
}
