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
import MenuItem from "@mui/material/MenuItem";
import { storage } from "../../config/firebase"; // Import Firebase storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const columnsBase = (handleDelete, handleEdit, handleStatusClick) => [
  { field: "book_Id", headerName: "ID", width: 220 },
  { field: "book_Title", headerName: "Title", width: 220 },
  {
    field: "cover_img",
    headerName: "Image",
    width: 120,
    renderCell: (params) =>
      params.row.cover_img ? (
        <img
          src={params.row.cover_img}
          alt="Book"
          style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
        />
      ) : (
        <Box
          sx={{
            width: 60,
            height: 60,
            bgcolor: "grey.200",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "grey.500",
            fontSize: 12,
          }}
        >
          No Image
        </Box>
      ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.row.status}
        color={
          params.row.status === "Approved"
            ? "success"
            : params.row.status === "Rejected"
            ? "error"
            : "default"
        }
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
  const [imageFile, setImageFile] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState("");

  // Status dialog state
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [statusBook, setStatusBook] = React.useState(null);
  const [statusValue, setStatusValue] = React.useState("");
  const [statusReason, setStatusReason] = React.useState("");

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
    setImagePreview(book.cover_img || "");
    setImageFile(null);
    setEditOpen(true);
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
    setEditValues((prev) => ({
      ...prev,
      status: "Pending", // status auto set to Pending on image change
    }));
  };

  // Handle edit field change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Upload image to Firebase and return URL
  const uploadImageToFirebase = async (file, bookId) => {
    const storageRef = ref(storage, `books/${bookId}/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    try {
      let cover_img = editBook.cover_img || "";
      if (imageFile) {
        cover_img = await uploadImageToFirebase(imageFile, editBook.book_Id);
      }
      const payload = {
        book_Id: editBook.book_Id,
        book_Title: editValues.book_Title,
        cover_img,
        status: "Pending", // always set to Pending on edit
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

  // Open status dialog
  const handleStatusClick = (book) => {
    setStatusBook(book);
    setStatusValue(book.status);
    setStatusReason(book.rejectionReason || "");
    setStatusDialogOpen(true);
  };

  // Save status change
  const handleStatusSave = async () => {
    if (statusValue === "Rejected" && !statusReason) {
      setSnackbar({
        open: true,
        message: "Rejection reason is required when status is Rejected.",
        severity: "error",
      });
      return;
    }
    try {
      await api.put(`/Book/${statusBook.book_Id}/status`, {
        status: statusValue,
        rejectionReason: statusValue === "Rejected" ? statusReason : "",
      });
      setSnackbar({
        open: true,
        message: "Status updated successfully.",
        severity: "success",
      });
      setStatusDialogOpen(false);
      fetchBooks();
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

  // Close the edit dialog
  const handleEditClose = () => {
    setEditOpen(false);
    setEditBook(null);
    setEditValues({
      book_Title: "",
      isActive: true,
      status: "",
      rejectionReason: "",
    });
    setImageFile(null);
    setImagePreview("");
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Book Management
      </Typography>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={books}
          columns={columnsBase(handleDelete, handleEdit, handleStatusClick)}
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
            onChange={(e) => {
              handleEditChange(e);
              setEditValues((prev) => ({
                ...prev,
                status: "Pending", // set status to Pending on any change
              }));
            }}
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Image
            </Typography>
            {imagePreview && (
              <Box sx={{ mb: 1 }}>
                <img
                  src={imagePreview}
                  alt="Book Cover"
                  style={{ width: 120, height: 120, objectFit: "cover" }}
                />
              </Box>
            )}
            <Button variant="outlined" component="label">
              {imagePreview ? "Replace Image" : "Add Image"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </Button>
          </Box>
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
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            select
            label="Status"
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
          {statusValue === "Rejected" && (
            <TextField
              label="Rejection Reason"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              fullWidth
              required
              variant="outlined"
              sx={{ mt: 2 }}
              error={!statusReason}
              helperText={!statusReason ? "Rejection reason is required." : ""}
            />
          )}
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
