import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

// Example: fetch data from API or props
// For now, use static sample data
const sampleAccounts = [
  {
    id: "1",
    account: "teacher1",
    password: "******",
    role: "Teacher",
    fullName: "Alice Smith",
  },
  {
    id: "2",
    account: "teacher2",
    password: "******",
    role: "Teacher",
    fullName: "Bob Johnson",
  },
];

const columns = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "account", headerName: "Account", width: 150 },
  { field: "password", headerName: "Password", width: 120 },
  { field: "role", headerName: "Role", width: 120 },
  { field: "fullName", headerName: "Full Name", width: 180 },
  {
    field: "edit",
    headerName: "Edit",
    width: 80,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <IconButton
        color="primary"
        size="small"
        onClick={() => alert(`Edit ${params.row.account}`)}
      >
        <EditIcon />
      </IconButton>
    ),
  },
  {
    field: "delete",
    headerName: "Delete",
    width: 80,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <IconButton
        color="error"
        size="small"
        onClick={() => alert(`Delete ${params.row.account}`)}
      >
        <DeleteIcon />
      </IconButton>
    ),
  },
];

export default function AccountGrid({ accounts = sampleAccounts }) {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Account Management
      </Typography>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={accounts}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          autoHeight
        />
      </Box>
    </Box>
  );
}
