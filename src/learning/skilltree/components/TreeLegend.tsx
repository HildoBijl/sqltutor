import { Box, Typography, IconButton } from "@mui/material";
import { EditNote, School, Close } from "@mui/icons-material";
import { useSettingsStore } from "@/store";

/*
 * TreeLegend component that displays a legend for the skill tree nodes.
 */
export function TreeLegend() {
  const hideLegend = useSettingsStore((state) => state.hideLegend);
  const setHideLegend = useSettingsStore((state) => state.setHideLegend);
  const hasAcessedSkillTree = useSettingsStore(
    (state) => state.hasAcessedSkillTree,
  );

  if (hideLegend) return null;

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
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: "background.paper",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Legend
          </Typography>
          {hasAcessedSkillTree && (
            <IconButton
              size="small"
              onClick={() => setHideLegend(true)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                opacity: 0.6,
                "&:hover": { opacity: 1, color: "red" },
                ml: 1,
                p: 0.25,
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <School fontSize="small" color="action" />
          </Box>
          <Typography variant="body2">Concept</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EditNote fontSize="small" color="action" />
          </Box>
          <Typography variant="body2">Skill</Typography>
        </Box>
      </Box>
    </Box>
  );
}
