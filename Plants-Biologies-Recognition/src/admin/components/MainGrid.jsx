import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChartUserByRole from "./ChartUserByRole.jsx";
import ChartBookByStatus from "./ChartBookByStatus.jsx";
import ChartBiologyByStatus from "./ChartBiologyByStatus.jsx";

import ChartSummary from "./ChartSummary.jsx";
import BookAccessStatisticsChart from "./BookAccessStatisticsChart.jsx";
import BiologiesAccessStatisticsChart from "./BiologiesAccessStatisticsChart.jsx";

export default function MainGrid() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <ChartUserByRole />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <ChartBookByStatus />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <ChartBiologyByStatus />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ChartSummary />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <BookAccessStatisticsChart />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <BiologiesAccessStatisticsChart />
        </Grid>
      </Grid>
    </Box>
  );
}
