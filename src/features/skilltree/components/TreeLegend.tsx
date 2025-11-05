import { Box, Typography } from "@mui/material";
import { MenuBook, Build, EditNote} from "@mui/icons-material";


/*
* TreeLegend component that displays a legend for the skill tree nodes.
*/  
export function TreeLegend() {
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 20,
        right: 20,
        zIndex: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 2,
          backgroundColor: "background.paper",
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          Legend
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 20,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MenuBook fontSize="small" color="action" />
          </Box>
          <Typography variant="body2">Concept</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 20,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EditNote fontSize="small" color="primary" />
          </Box>
          <Typography variant="body2">Skill</Typography>
        </Box>
      </Box>
    </Box>
  );
}
