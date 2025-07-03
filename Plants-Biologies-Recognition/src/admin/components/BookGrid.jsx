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
  { field: "book_Id", headerName: "ID", width: 220 },
  { field: "book_Title", headerName: "Title", width: 220 },
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
        onClick={() => handleDelete(params.row.book_Id)}
      >
        <DeleteIcon />
      </IconButton>
    ),
  },
];

export default function BookGrid() {
  const [books, setBooks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Edit dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editBook, setEditBook] = React.useState(null);
  const [editValues, setEditValues] = React.useState({
    book_Title: "",
    isActive: true,
    status: "",
    rejectionReason: "",
  });

  const fetchBooks = React.useCallback(() => {
    setLoading(true);
    api
      .get("/Book/search")
      .then((res) => {
        setBooks(res.data);
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await api.delete(`/Book/${id}`);
      setSnackbar({
        open: true,
        message: "Book deleted successfully.",
        severity: "success",
      });
      fetchBooks();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to delete book.",
        severity: "error",
      });
    }
  };

  // Handle edit dialog open
  const handleEdit = (book) => {
    setEditBook(book);
    setEditValues({
      book_Title: book.book_Title,
      isActive: book.isActive,
      status: book.status,
      rejectionReason: book.rejectionReason || "",
    });
    setEditOpen(true);
  };

  // Handle edit dialog close
  const handleEditClose = () => {
    setEditOpen(false);
    setEditBook(null);
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
        book_Id: editBook.book_Id,
        book_Title: editValues.book_Title,
        isActive: editValues.isActive,
        status: editValues.status,
        rejectionReason: editValues.rejectionReason,
      };
      await api.put(`/Book/${editBook.book_Id}`, payload);
      setSnackbar({
        open: true,
        message: "Book updated successfully.",
        severity: "success",
      });
      setEditOpen(false);
      fetchBooks();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to update book.",
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
        Book Management
      </Typography>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={books}
          columns={columnsBase(handleDelete, handleEdit)}
          getRowId={(row) => row.book_Id}
          loading={loading}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          autoHeight
        />
      </Box>
      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Book</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
          }}
        >
          <TextField
            label="Title"
            name="book_Title"
            value={editValues.book_Title}
            onChange={handleEditChange}
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
          />
          <TextField
            label="Status"
            name="status"
            value={editValues.status}
            onChange={handleEditChange}
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
          />
          <TextField
            label="Rejection Reason"
            name="rejectionReason"
            value={editValues.rejectionReason || ""}
            onChange={handleEditChange}
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
          />
          <TextField
            label="Active"
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
