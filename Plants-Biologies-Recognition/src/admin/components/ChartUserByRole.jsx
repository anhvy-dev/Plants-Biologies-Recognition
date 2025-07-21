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

import { FaUserTie, FaUserGraduate, FaUserShield } from "react-icons/fa";

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

export default function ChartUserByCountry() {
  const [userStats, setUserStats] = useState({
    total: 0,
    Admin: 0,
    Teacher: 0,
    Student: 0,
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await api.get("/User/search");
        const users = res.data || [];
        const stats = {
          total: users.length,
          Admin: users.filter((u) => u.role === "Admin").length,
          Teacher: users.filter((u) => u.role === "Teacher").length,
          Student: users.filter((u) => u.role === "Student").length,
        };
        setUserStats(stats);
      } catch {
        setUserStats({ total: 0, Admin: 0, Teacher: 0, Student: 0 });
      }
    }
    fetchUsers();
  }, []);

  const chartData = [
    { label: "Admin", value: userStats.Admin },
    { label: "Teacher", value: userStats.Teacher },
    { label: "Student", value: userStats.Student },
  ];

  const chartColors = [
    "hsl(220, 20%, 65%)",
    "hsl(220, 20%, 42%)",
    "hsl(220, 20%, 35%)",
  ];

  return (
    <Card
      variant="outlined"
      sx={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Users by role
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
              primaryText={userStats.total.toLocaleString()}
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
                minWidth: 60,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {item.label === "Admin" && (
                <FaUserShield style={{ marginRight: 4 }} />
              )}
              {item.label === "Teacher" && (
                <FaUserTie style={{ marginRight: 4 }} />
              )}
              {item.label === "Student" && (
                <FaUserGraduate style={{ marginRight: 4 }} />
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
                  userStats.total ? (item.value / userStats.total) * 100 : 0
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
