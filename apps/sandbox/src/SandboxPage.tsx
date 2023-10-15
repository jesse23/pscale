import { Grid, GridItem, Heading } from "@chakra-ui/react";
import Pane from "./SandboxGrid";

export const SandboxPage = () =>
<Grid
  templateAreas={`"header"
                  "main"
                  "footer"`}
  gridTemplateRows={'50px 1fr 30px'}
  gridTemplateColumns={'1fr'}
  h='100%'
  gap='0'
  color='blackAlpha.700'
  fontWeight='bold'
>
  <GridItem pl='2' /*bg='orange.300'*/ area={'header'}>
    <Heading as ='h1' size='lg'>trmx</Heading>
  </GridItem>
  <GridItem pl='2' /*bg='green.300'*/ area={'main'}>
    <Pane />
  </GridItem>
  <GridItem pl='2' bg='blue.300' area={'footer'}>
    Footer
  </GridItem>
</Grid>