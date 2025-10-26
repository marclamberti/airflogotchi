import { Box } from "@chakra-ui/react";
import { PixelLandscape } from "src/components/PixelLandscape";

export const HomePage = () => {
  return (
    <Box flexGrow={1} height="100vh" width="100%" p={0} m={0} bg="bg.subtle">
      <Box width="100%" height="100%">
        <PixelLandscape />
      </Box>
    </Box>
  );
};
