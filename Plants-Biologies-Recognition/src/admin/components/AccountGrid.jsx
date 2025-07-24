import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add"; // Add this import at the top
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
import MenuItem from "@mui/material/MenuItem";

const columnsBase = (handleDelete, handleEdit, handleStatusClick) => [
  { field: "user_Id", headerName: "ID", width: 100 },
  { field: "account", headerName: "Account", width: 150 },
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
        onClick={() => handleStatusClick(params.row)}
        sx={{ cursor: "pointer" }}
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
        onClick={() => handleDelete(params.row.user_Id)} // <-- fix here
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
    account: "",
    email: "",
    fullName: "",
    password: "",
    role: "",
    isActive: true,
  });

  // Create dialog state
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createValues, setCreateValues] = React.useState({
    account: "",
    password: "",
    role: "Teacher",
    fullName: "",
    isActive: true,
  });

  // Add state for status dialog
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [statusUser, setStatusUser] = React.useState(null);
  const [statusValue, setStatusValue] = React.useState(true);

  const fetchAccounts = React.useCallback(() => {
    setLoading(true);
    api
      .get("/User/search") // changed from /User/getAllUsers to /User/search
      .then((res) => {
        setAccounts(res.data);
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
      account: user.account,
      email: user.email || "",
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
        account: editValues.account,
        email: editValues.email,
        password:
          editValues.password && editValues.password.trim() !== ""
            ? editValues.password
            : editUser.password || "", // send old password if not changed (or required by API)
        fullName: editValues.fullName,
        role: editValues.role,
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

  const handleCreateOpen = () => setCreateOpen(true);
  const handleCreateClose = () => setCreateOpen(false);

  const handleCreateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateSubmit = async () => {
    try {
      // Add email field to match API requirements
      await api.post("/User/admin-create", {
        account: createValues.account,
        email: createValues.email || "", // Add email field
        password: createValues.password,
        role: createValues.role,
        fullName: createValues.fullName,
        isActive: createValues.isActive,
      });
      setSnackbar({
        open: true,
        message: "Account created successfully.",
        severity: "success",
      });
      setCreateOpen(false);
      setCreateValues({
        account: "",
        email: "", // Reset email field
        password: "",
        role: "Teacher",
        fullName: "",
        isActive: true,
      });
      fetchAccounts();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to create account.",
        severity: "error",
      });
    }
  };

  // Handler to open status dialog
  const handleStatusClick = (user) => {
    setStatusUser(user);
    setStatusValue(user.isActive);
    setStatusDialogOpen(true);
  };

  // Handler to save status change
  const handleStatusSave = async () => {
    try {
      await api.put(`/User/${statusUser.user_Id}/status`, {
        isActive: statusValue,
      });
      setSnackbar({
        open: true,
        message: "Status updated successfully.",
        severity: "success",
      });
      setStatusDialogOpen(false);
      fetchAccounts();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to update status.",
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
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleCreateOpen}
        >
          Create
        </Button>
      </Box>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={accounts}
          columns={columnsBase(handleDelete, handleEdit, handleStatusClick)}
          loading={loading}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          autoHeight
          getRowId={(row) => row.user_Id}
        />
      </Box>
      {/* Create Dialog */}
      <Dialog
        open={createOpen}
        onClose={handleCreateClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Account</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
          }}
        >
          <TextField
            label="Account"
            name="account"
            value={createValues.account}
            onChange={handleCreateChange}
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={createValues.password}
            onChange={handleCreateChange}
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <TextField
            label="Full Name"
            name="fullName"
            value={createValues.fullName}
            onChange={handleCreateChange}
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <TextField
            select
            label="Role"
            name="role"
            value={createValues.role}
            onChange={handleCreateChange}
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Teacher">Teacher</MenuItem>
            <MenuItem value="Student">Student</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            name="isActive"
            value={createValues.isActive ? "Active" : "Inactive"}
            onChange={(e) =>
              setCreateValues((prev) => ({
                ...prev,
                isActive: e.target.value === "Active",
              }))
            }
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
          <TextField
            label="Email"
            name="email"
            value={createValues.email}
            onChange={handleCreateChange}
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose}>Cancel</Button>
          <Button onClick={handleCreateSubmit} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
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
            label="Account"
            name="account"
            value={editValues.account}
            onChange={handleEditChange}
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
          />
          <TextField
            label="Email"
            name="email"
            value={editValues.email}
            onChange={handleEditChange}
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
          />
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
            select
            label="Status"
            name="isActive"
            value={editValues.isActive ? "Active" : "Inactive"}
            onChange={(e) =>
              setEditValues((prev) => ({
                ...prev,
                isActive: e.target.value === "Active",
              }))
            }
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Status Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Change Status</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
          }}
        >
          <TextField
            select
            label="Status"
            value={statusValue ? "Active" : "Inactive"}
            onChange={(e) => setStatusValue(e.target.value === "Active")}
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
          <DialogContent>
            Changing status will update the account's active state.
          </DialogContent>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusSave} variant="contained">
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
