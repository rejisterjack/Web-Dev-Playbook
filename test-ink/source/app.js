import { Text, Box } from 'ink';

function App() {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="green">
        Welcome to My Ink App!
      </Text>
      <Text>This is running in your terminal.</Text>
      <Box marginTop={1} borderStyle="round" borderColor="blue">
        <Text>Boxes support flexbox layout with Yoga</Text>
      </Box>
    </Box>
  );
}

export default App;