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
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

const columnsBase = (handleDelete, handleEdit, handleStatusClick) => [
  { field: "chapter_Id", headerName: "ID", width: 220 },
  { field: "chapter_Title", headerName: "Title", width: 220 },
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
    field: "rejectionReason",
    headerName: "Reject Reason",
    width: 220,
    renderCell: (params) => params.row.rejectionReason || "",
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
        onClick={() => handleDelete(params.row.chapter_Id)}
      >
        <DeleteIcon />
      </IconButton>
    ),
  },
];

export default function ChapterGrid() {
  const [chapters, setChapters] = React.useState([]);
  const [books, setBooks] = React.useState([]);
  const [selectedBook, setSelectedBook] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Edit dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editChapter, setEditChapter] = React.useState(null);
  const [editValues, setEditValues] = React.useState({
    chapter_Title: "",
    status: "",
    rejectionReason: "",
  });

  // Status dialog state
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [statusChapter, setStatusChapter] = React.useState(null);
  const [statusValue, setStatusValue] = React.useState("");
  const [statusReason, setStatusReason] = React.useState("");

  // Fetch books for menu
  React.useEffect(() => {
    api
      .get("/Book/search")
      .then((res) => setBooks(res.data))
      .catch(() => setBooks([]));
  }, []);

  // Fetch chapters for selected book
  const fetchChapters = React.useCallback(() => {
    if (!selectedBook) {
      setChapters([]);
      return;
    }
    setLoading(true);
    api
      .get(`/Chapter/search?bookId=${selectedBook}`)
      .then((res) => setChapters(res.data))
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, [selectedBook]);

  React.useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  // CRUD handlers
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this chapter?"))
      return;
    try {
      await api.delete(`/Chapter/${id}`);
      setSnackbar({
        open: true,
        message: "Chapter deleted successfully.",
        severity: "success",
      });
      fetchChapters();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to delete chapter.",
        severity: "error",
      });
    }
  };

  const handleEdit = (chapter) => {
    setEditChapter(chapter);
    setEditValues({
      chapter_Title: chapter.chapter_Title,
      status: chapter.status,
      rejectionReason: chapter.rejectionReason || "",
    });
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: value,
      status: "Pending", // set status to Pending on any change
    }));
  };

  const handleEditSubmit = async () => {
    try {
      await api.put(`/Chapter/${editChapter.chapter_Id}`, {
        chapter_Id: editChapter.chapter_Id,
        chapter_Title: editValues.chapter_Title,
        status: "Pending",
        rejectionReason: editValues.rejectionReason,
      });
      setSnackbar({
        open: true,
        message: "Chapter updated successfully.",
        severity: "success",
      });
      setEditOpen(false);
      fetchChapters();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to update chapter.",
        severity: "error",
      });
    }
  };

  // Status change
  const handleStatusClick = (chapter) => {
    setStatusChapter(chapter);
    setStatusValue(chapter.status);
    setStatusReason(chapter.rejectionReason || "");
    setStatusDialogOpen(true);
  };

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
      await api.put(`/Chapter/${statusChapter.chapter_Id}/status`, {
        status: statusValue,
        rejectionReason: statusValue === "Rejected" ? statusReason : "",
      });
      setSnackbar({
        open: true,
        message: "Status updated successfully.",
        severity: "success",
      });
      setStatusDialogOpen(false);
      fetchChapters();
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

  const handleEditClose = () => {
    setEditOpen(false);
    setEditChapter(null);
    setEditValues({
      chapter_Title: "",
      status: "",
      rejectionReason: "",
    });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Chapter Management
      </Typography>
      <FormControl sx={{ minWidth: 300, mb: 2 }}>
        <InputLabel id="book-select-label">Choose Book</InputLabel>
        <Select
          labelId="book-select-label"
          value={selectedBook}
          label="Choose Book"
          onChange={(e) => setSelectedBook(e.target.value)}
        >
          {books.map((book) => (
            <MenuItem key={book.book_Id} value={book.book_Id}>
              {book.book_Title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={chapters}
          columns={columnsBase(handleDelete, handleEdit, handleStatusClick)}
          getRowId={(row) => row.chapter_Id}
          loading={loading}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          autoHeight
        />
      </Box>
      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Chapter</DialogTitle>
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
            name="chapter_Title"
            value={editValues.chapter_Title}
            onChange={handleEditChange}
            fullWidth
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
