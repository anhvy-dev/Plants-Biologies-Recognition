import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";
import api from "../../config/axios.jsx";

export default function BookAccessStatisticsChart() {
  const theme = useTheme();
  const colorPalette = [
    (theme.vars || theme).palette.primary.dark,
    (theme.vars || theme).palette.primary.main,
    (theme.vars || theme).palette.primary.light,
  ];

  const [stats, setStats] = React.useState([]);

  React.useEffect(() => {
    async function fetchBooksAndStats() {
      try {
        const booksRes = await api.get("/Book/search");
        const booksData = booksRes.data || [];

        // Fetch statistics for each book in parallel
        const statsPromises = booksData
          .filter((book) => book.book_Id)
          .map((book) =>
            api
              .get(`/AccessBook/book/${book.book_Id}/statistics`)
              .then((res) => ({
                name: book.book_Title,
                visitedNumber: res.data.visitedNumber,
                uniqueVisitors: res.data.uniqueVisitors,
              }))
              .catch(() => ({
                name: book.book_Title,
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
    fetchBooksAndStats();
  }, []);

  const chartLabels = stats.map((s) => s.name);
  const chartSeries = [
    {
      id: "visitedNumber",
      label: "Visits",
      data: stats.map((s) => s.visitedNumber),
      stack: "A",
      color: colorPalette[0],
    },
    {
      id: "uniqueVisitors",
      label: "Unique Visitors",
      data: stats.map((s) => s.uniqueVisitors),
      stack: "A",
      color: colorPalette[1],
    },
  ];

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Book Access Statistics
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
            Visits and unique visitors for all books
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
