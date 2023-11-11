import { Grid, GridItem, Heading, Link } from '@chakra-ui/react';
import TrmxPanel from './TrmxView';
import DifxPanel from './DifxView';
import { useState } from 'react';

const MODE = {
  TRMX: 'trmx',
  DIFX: 'difx',
}

export const SandboxPage = () => {
  const [mode, setMode] = useState(MODE.DIFX);
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
        {mode === MODE.DIFX && <DifxPanel /> }
        {mode === MODE.TRMX && <TrmxPanel /> }
      </GridItem>
      <GridItem
        pl="2"
        /*bg="blue.300"*/ area={'footer'}
        borderTop="1px"
        borderColor={'#E2E8F0'}
      >
        <Link onClick={()=>setMode(MODE.DIFX)} paddingRight={3} fontFamily={'mono'}>
          difx{mode===MODE.DIFX?'*':' '}
        </Link>
        <Link onClick={()=>setMode(MODE.TRMX)} paddingRight={3} fontFamily={'mono'}>
          trmx{mode===MODE.TRMX?'*':' '}
        </Link>
      </GridItem>
    </Grid>
  );
};
