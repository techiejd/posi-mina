import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import PosiPage from "../../modules/posiPage";
import { useAccounts } from "../../modules/useAccounts";
import Admin from "../../modules/admin.page";
import Maker from "../../modules/maker.page";
import Supporter from "../../modules/supporter.page";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const accounts = useAccounts();

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Admin" />
          <Tab label="Maker" />
          <Tab label="Supporter" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Admin />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Maker />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Supporter />
      </TabPanel>
    </Box>
  );
}
