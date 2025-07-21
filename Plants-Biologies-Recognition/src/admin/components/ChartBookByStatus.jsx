import * as React from "react";
import PropTypes from "prop-types";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { useEffect, useState } from "react";
import api from "../../config/axios.jsx";

import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from "react-icons/fa";

const StyledText = styled("text", {
  shouldForwardProp: (prop) => prop !== "variant",
})(({ theme }) => ({
  textAnchor: "middle",
  dominantBaseline: "central",
  fill: (theme.vars || theme).palette.text.secondary,
  variants: [
    {
      props: {
        variant: "primary",
      },
      style: {
        fontSize: theme.typography.h5.fontSize,
      },
    },
    {
      props: ({ variant }) => variant !== "primary",
      style: {
        fontSize: theme.typography.body2.fontSize,
      },
    },
    {
      props: {
        variant: "primary",
      },
      style: {
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: ({ variant }) => variant !== "primary",
      style: {
        fontWeight: theme.typography.body2.fontWeight,
      },
    },
  ],
}));

function PieCenterLabel({ primaryText, secondaryText }) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <React.Fragment>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </React.Fragment>
  );
}

PieCenterLabel.propTypes = {
  primaryText: PropTypes.string.isRequired,
  secondaryText: PropTypes.string.isRequired,
};

export default function ChartBookByStatus() {
  const [bookStats, setBookStats] = useState({
    total: 0,
    Approved: 0,
    Rejected: 0,
    Pending: 0,
  });

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await api.get("/Book/search");
        const books = res.data || [];
        const stats = {
          total: books.length,
          Approved: books.filter((b) => b.status === "Approved").length,
          Rejected: books.filter((b) => b.status === "Rejected").length,
          Pending: books.filter((b) => b.status === "Pending").length,
        };
        setBookStats(stats);
      } catch {
        setBookStats({ total: 0, Approved: 0, Rejected: 0, Pending: 0 });
      }
    }
    fetchBooks();
  }, []);

  const chartData = [
    { label: "Approved", value: bookStats.Approved },
    { label: "Rejected", value: bookStats.Rejected },
    { label: "Pending", value: bookStats.Pending },
  ];

  const chartColors = [
    "hsl(120, 60%, 50%)", // green for approved
    "hsl(0, 60%, 50%)", // red for rejected
    "gray", // orange for pending
  ];

  return (
    <Card
      variant="outlined"
      sx={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Books by status
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PieChart
            colors={chartColors}
            margin={{
              left: 80,
              right: 80,
              top: 80,
              bottom: 80,
            }}
            series={[
              {
                data: chartData,
                innerRadius: 75,
                outerRadius: 100,
                paddingAngle: 0,
                highlightScope: { fade: "global", highlight: "item" },
              },
            ]}
            height={260}
            width={260}
            hideLegend
          >
            <PieCenterLabel
              primaryText={bookStats.total.toLocaleString()}
              secondaryText="Total"
            />
          </PieChart>
        </Box>
        {chartData.map((item, idx) => (
          <Stack
            key={item.label}
            direction="row"
            sx={{ alignItems: "center", gap: 2, pb: 2 }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: "500",
                minWidth: 80,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {item.label === "Approved" && (
                <FaCheckCircle style={{ marginRight: 4, color: "green" }} />
              )}
              {item.label === "Rejected" && (
                <FaTimesCircle style={{ marginRight: 4, color: "red" }} />
              )}
              {item.label === "Pending" && (
                <FaHourglassHalf style={{ marginRight: 4, color: "gray" }} />
              )}
              {item.label}
            </Typography>
            <Stack sx={{ gap: 1, flexGrow: 1 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {item.value}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                aria-label={`Number of ${item.label}`}
                value={
                  bookStats.total ? (item.value / bookStats.total) * 100 : 0
                }
                sx={{
                  [`& .${linearProgressClasses.bar}`]: {
                    backgroundColor: chartColors[idx],
                  },
                }}
              />
            </Stack>
          </Stack>
        ))}
      </CardContent>
    </Card>
  );
}
