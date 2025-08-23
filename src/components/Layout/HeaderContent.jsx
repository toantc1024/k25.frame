import { Avatar, Box, Group, Image } from "@mantine/core";
import classes from "../../styles/HeaderContent.module.css";
import LOGO from "../../assets/LOGO.png";

export default function HeaderContent() {
  return (
    <Box pb={0}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Group h="100%" gap={0} visibleFrom="sm"></Group>
          <Group justify="center">
            <Image src={LOGO} alt="LOGO" height={80} />
          </Group>
          <Group></Group>
        </Group>
      </header>
    </Box>
  );
}
