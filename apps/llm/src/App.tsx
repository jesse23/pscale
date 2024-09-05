import { Grid, GridItem, Link } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Allotment } from 'allotment';
import DifxView from './DifxView';
import GptView from './GptView';

const MODE = {
  DIFX: 'difx',
  LLM: 'llm',
};

export const App = () => {
  const [mode, setMode] = useState(MODE.DIFX);
  const [fileList, setFileList] = useState([] as string[]);
  const [selectedFile, setSelectedFile] = useState('Awp0DatasetSummary.xml');

  useEffect(() => {
    const loadFileList = async () => {
      const fileList = await fetch('/.local/data/files.json').then((res) =>
        res.json()
      );
      setFileList(fileList);
    };
    loadFileList();
  }, []);

  return (
    <Allotment defaultSizes={[15, 85]}>
      <Allotment.Pane>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            gap: '5px',
          }}
        >
          {fileList.map((fileName) => (
            <Link
              onClick={() => setSelectedFile(fileName)}
              paddingRight={5}
              fontFamily={'mono'}
            >
              {fileName}
              {selectedFile === fileName ? '*' : ' '}
            </Link>
          ))}
        </div>
      </Allotment.Pane>
      <Allotment.Pane>
        <Grid
          templateAreas={`
                  "menu"
                  "main"
                  `}
          gridTemplateRows={'30px 1fr'}
          gridTemplateColumns={'1fr'}
          h="100%"
          gap="0"
          color="blackAlpha.700"
          fontWeight="bold"
        >
          <GridItem
            pl="2"
            /*bg="blue.300"*/ area={'menu'}
            borderTop="1px"
            borderColor={'#E2E8F0'}
          >
            <Link
              onClick={() => setMode(MODE.DIFX)}
              paddingRight={5}
              fontFamily={'mono'}
            >
              {MODE.DIFX}
              {mode === MODE.DIFX ? '*' : ' '}
            </Link>
            <Link
              onClick={() => setMode(MODE.LLM)}
              paddingRight={5}
              fontFamily={'mono'}
            >
              {MODE.LLM}
              {mode === MODE.LLM ? '*' : ' '}
            </Link>
          </GridItem>
          <GridItem
            pl="2"
            /*bg='green.300'*/ area={'main'}
            display="flex"
            borderTop="1px"
            borderColor={'#E2E8F0'}
          >
            {mode === MODE.DIFX && <DifxView selectedFile={selectedFile} />}
            {mode === MODE.LLM && <GptView selectedFile={selectedFile} />}
          </GridItem>
        </Grid>
      </Allotment.Pane>
    </Allotment>
  );
};
