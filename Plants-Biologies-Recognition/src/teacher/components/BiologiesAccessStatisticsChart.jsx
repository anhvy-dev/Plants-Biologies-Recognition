import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";
import api from "../../config/axios.jsx";

export default function BiologiesAccessStatisticsChart() {
  const theme = useTheme();
  const colorPalette = [
    (theme.vars || theme).palette.primary.dark,
    (theme.vars || theme).palette.primary.main,
    (theme.vars || theme).palette.primary.light,
  ];

  const [stats, setStats] = React.useState([]);

  React.useEffect(() => {
    async function fetchBiologiesAndStats() {
      try {
        const biologiesRes = await api.get("/Biologies/search");
        const biologiesData = biologiesRes.data || [];
        // Fetch statistics for each biology in parallel
        const statsPromises = biologiesData
          .filter((bio) => bio.id)
          .map((bio) =>
            api
              .get(`/AccessBiology/biology/${bio.id}/statistics`)
              .then((res) => ({
                name: bio.commonName,
                visitedNumber: res.data.visitedNumber,
                uniqueVisitors: res.data.uniqueVisitors,
              }))
              .catch(() => ({
                name: bio.commonName,
                visitedNumber: 0,
                uniqueVisitors: 0,
              }))
          );
        const statsData = await Promise.all(statsPromises);
        setStats(statsData);
      } catch {
        setStats([]);
      }
    }
    fetchBiologiesAndStats();
  }, []);

  const chartLabels = stats.map((s) => s.name);
  const chartSeries = [
    {
      id: "visitedNumber",
      label: "Visits",
      data: stats.map((s) => s.visitedNumber),
      stack: "A",
      color: "#e53935", // red
    },
    {
      id: "uniqueVisitors",
      label: "Unique Visitors",
      data: stats.map((s) => s.uniqueVisitors),
      stack: "A",
      color: "#e53935", // red
    },
  ];

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Biology Access Statistics
        </Typography>
        <Stack sx={{ justifyContent: "space-between" }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: "center", sm: "flex-start" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {stats.reduce((sum, s) => sum + s.visitedNumber, 0)}
            </Typography>
            <Chip size="small" color="success" label="Visits" />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Visits and unique visitors for all biologies
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[
            {
              scaleType: "band",
              categoryGapRatio: 0.5,
              data: chartLabels,
              height: 24,
            },
          ]}
          yAxis={[{ width: 50 }]}
          series={chartSeries}
          height={250}
          margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          legend={{ position: "top" }}
          stack
        />
      </CardContent>
    </Card>
  );
}
