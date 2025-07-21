import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";
import api from "../../config/axios.jsx";

export default function ChartSummary() {
  const theme = useTheme();
  const colorPalette = [
    "#FFD700", // Gold
    "#FFA500", // Orange
    "#FF8C00", // Dark Orange
  ];

  const [stats, setStats] = React.useState([]);

  React.useEffect(() => {
    async function fetchBooksAndStats() {
      try {
        const booksRes = await api.get("/Book/search");
        const booksData = booksRes.data || [];

        // Calculate counts from the nested data structure
        const statsData = booksData.map((book) => {
          const chapters = book.chapters || [];
          const lessons = chapters.flatMap((chapter) => chapter.lessons || []);
          const biologies = lessons.flatMap(
            (lesson) => lesson.plant_Biology_Animal || []
          );

          return {
            name: book.book_Title,
            chapters: chapters.length,
            lessons: lessons.length,
            biologies: biologies.length,
          };
        });

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
      id: "chapters",
      label: "Chapters",
      data: stats.map((s) => s.chapters),
      color: colorPalette[0],
    },
    {
      id: "lessons",
      label: "Lessons",
      data: stats.map((s) => s.lessons),
      color: colorPalette[1],
    },
    {
      id: "biologies",
      label: "Biologies",
      data: stats.map((s) => s.biologies),
      color: colorPalette[2],
    },
  ];

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Content Summary by Book
        </Typography>
        <Stack sx={{ justifyContent: "space-between", mb: 2 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Number of chapters, lessons, and biologies for each book
          </Typography>
        </Stack>
        <BarChart
          xAxis={[
            {
              scaleType: "band",
              data: chartLabels,
              categoryGapRatio: 0.3,
            },
          ]}
          series={chartSeries}
          height={350}
          colors={colorPalette}
          legend={{ position: "top" }}
          margin={{ left: 50, right: 20, top: 60, bottom: 80 }}
          grid={{ horizontal: true }}
        />
      </CardContent>
    </Card>
  );
}
