import { Allotment } from 'allotment';
import { CodeEditor } from './components/CodeEditor';
import { useEffect, useState } from 'react';
import { compareFilesWithGPT } from './services/llm';
import styles from './View.module.css';
import 'allotment/dist/style.css';

export default function GptView({ selectedFile }: { selectedFile: string }) {
  // source
  const [src, setSrc] = useState('');
  const [tar, setTar] = useState('');

  const [result, setResult] = useState('');

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
    if (src && tar) {
      compareFilesWithGPT(src, tar).then((differences) => {
        setResult(differences);
      });
    }
    // put something here
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
              <CodeEditor code={result} type="js" onChange={setResult} />
              {/* 
              <DifxNodeViewPanel nodes={viewNodes} />
              */}
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
}
