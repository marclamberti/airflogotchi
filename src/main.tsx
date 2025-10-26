import { ChakraProvider } from "@chakra-ui/react";
import { FC } from "react";

import { ColorModeProvider } from "src/context/colorMode";
import { HomePage } from "src/pages/HomePage";

import { system } from "./theme";

export interface PluginComponentProps {
  // Add any props your plugin component needs
}

/**
 * Main plugin component
 */
const PluginComponent: FC<PluginComponentProps> = (props) => {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider>
          <HomePage />
      </ColorModeProvider>
    </ChakraProvider>
  );
};

export default PluginComponent;
