import { Grid, GridItem, Heading, Link } from '@chakra-ui/react';
import TrmxView from './TrmxView';
import DifxJsonView from './DifxJsonView';
import DifxXmlView from './DifxXmlView';
import { useState } from 'react';

const MODE = {
  DIFX_JSON: 'difx(json)',
  DIFX_XML: 'difx(xml)',
  TRMX: 'trmx',
}

export const SandboxPage = () => {
  const [mode, setMode] = useState(MODE.DIFX_JSON);
  return (
    <Grid
      templateAreas={`"header"
                  "main"
                  "footer"`}
      gridTemplateRows={'50px 1fr 30px'}
      gridTemplateColumns={'1fr'}
      h="100%"
      gap="0"
      color="blackAlpha.700"
      fontWeight="bold"
    >
      <GridItem pl="2" /*bg='orange.300'*/ area={'header'}>
        <Heading as="h1" size="lg" paddingTop={1}>
          {mode}
        </Heading>
      </GridItem>
      <GridItem
        pl="2"
        /*bg='green.300'*/ area={'main'}
        display="flex"
        borderTop="1px"
        borderColor={'#E2E8F0'}
      >
        {mode === MODE.DIFX_JSON && <DifxJsonView /> }
        {mode === MODE.DIFX_XML && <DifxXmlView />}
        {mode === MODE.TRMX && <TrmxView /> }
      </GridItem>
      <GridItem
        pl="2"
        /*bg="blue.300"*/ area={'footer'}
        borderTop="1px"
        borderColor={'#E2E8F0'}
      >
        <Link onClick={()=>setMode(MODE.DIFX_JSON)} paddingRight={3} fontFamily={'mono'}>
          {MODE.DIFX_JSON}{mode===MODE.DIFX_JSON?'*':' '}
        </Link>
        <Link onClick={()=>setMode(MODE.DIFX_XML)} paddingRight={3} fontFamily={'mono'}>
          {MODE.DIFX_XML}{mode===MODE.DIFX_XML?'*':' '}
        </Link>
        <Link onClick={()=>setMode(MODE.TRMX)} paddingRight={3} fontFamily={'mono'}>
          {MODE.TRMX}{mode===MODE.TRMX?'*':' '}
        </Link>
      </GridItem>
    </Grid>
  );
};
