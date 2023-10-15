import { ChakraProvider } from '@chakra-ui/react'
import { SandboxPage } from './SandboxPage';

export default function App() {
  // 2. Wrap ChakraProvider at the root of your app
  return (
    <ChakraProvider>
      <SandboxPage />
    </ChakraProvider>
  )
}