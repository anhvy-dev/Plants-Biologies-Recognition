import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Chip from "@mui/material/Chip";
import api from "../../config/axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const columnsBase = (handleDelete, handleEdit) => [
  { field: "id", headerName: "ID", width: 100 },
  { field: "account", headerName: "Account", width: 150 },
  { field: "password", headerName: "Password", width: 120 },
  { field: "role", headerName: "Role", width: 120 },
  { field: "fullName", headerName: "Full Name", width: 180 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.row.isActive ? "Active" : "Inactive"}
        color={params.row.isActive ? "success" : "default"}
        size="small"
        variant="outlined"
      />
    ),
  },
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
        onClick={() => handleEdit(params.row)}
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
        onClick={() => handleDelete(params.row.id)}
      >
        <DeleteIcon />
      </IconButton>
    ),
  },
];

export default function AccountGrid() {
  const [accounts, setAccounts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Edit dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState(null);
  const [editValues, setEditValues] = React.useState({
    fullName: "",
    password: "",
    role: "",
    isActive: true,
  });

  const fetchAccounts = React.useCallback(() => {
    setLoading(true);
    api
      .get("/User/search") // changed from /User/getAllUsers to /User/search
      .then((res) => {
        const users = res.data.map((user, idx) => ({
          id: user.userId || idx + 1,
          account: user.account,
          password: "******",
          role: user.role,
          fullName: user.fullName,
          isActive: user.isActive,
        }));
        setAccounts(users);
      })
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?"))
      return;
    try {
      await api.delete(`/User/${id}`);
      setSnackbar({
        open: true,
        message: "Account deleted successfully.",
        severity: "success",
      });
      fetchAccounts();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to delete account.",
        severity: "error",
      });
    }
  };

  // Handle edit dialog open
  const handleEdit = (user) => {
    setEditUser(user);
    setEditValues({
      fullName: user.fullName,
      password: "", // empty by default for security
      role: user.role,
      isActive: user.isActive,
    });
    setEditOpen(true);
  };

  // Handle edit dialog close
  const handleEditClose = () => {
    setEditOpen(false);
    setEditUser(null);
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    try {
      const payload = {
        user_Id: editUser.user_Id || editUser.id, // use user_Id if available, fallback to id
        account: editUser.account,
        password:
          editValues.password && editValues.password.trim() !== ""
            ? editValues.password
            : editUser.password || "", // send old password if not changed (or required by API)
        fullName: editValues.fullName,
        role: editUser.role,
        isActive: editValues.isActive,
      };
      await api.put(`/User/${editUser.user_Id || editUser.id}`, payload);
      setSnackbar({
        open: true,
        message: "Account updated successfully.",
        severity: "success",
      });
      setEditOpen(false);
      fetchAccounts();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to update account.",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Account Management
      </Typography>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={accounts}
          columns={columnsBase(handleDelete, handleEdit)}
          loading={loading}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          autoHeight
        />
      </Box>
      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Account</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
          }}
        >
          <TextField
            label="Full Name"
            name="fullName"
            value={editValues.fullName}
            onChange={handleEditChange}
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={editValues.password || ""}
            onChange={handleEditChange}
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
          />
          <TextField
            label="Role"
            name="role"
            value={editValues.role}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            sx={{ mt: 3 }}
          />
          <TextField
            label="Status"
            name="isActive"
            value={editValues.isActive ? "Active" : "Inactive"}
            onChange={() =>
              setEditValues((prev) => ({
                ...prev,
                isActive: !prev.isActive,
              }))
            }
            fullWidth
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Button
                  onClick={() =>
                    setEditValues((prev) => ({
                      ...prev,
                      isActive: !prev.isActive,
                    }))
                  }
                  size="small"
                  variant="outlined"
                  color={editValues.isActive ? "success" : "inherit"}
                  sx={{
                    ml: 1,
                    borderColor: editValues.isActive
                      ? "success.main"
                      : "grey.400",
                  }}
                >
                  Toggle
                </Button>
              ),
            }}
            variant="outlined"
            sx={{ mt: 3 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
