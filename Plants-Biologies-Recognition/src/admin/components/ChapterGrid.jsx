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
import AddIcon from "@mui/icons-material/Add";

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

  // Create dialog state
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createTitle, setCreateTitle] = React.useState("");

  // Enhanced book selection handler
  const handleBookChange = (e) => {
    const bookId = e.target.value;
    console.log("Selected book ID:", bookId); // Debug log

    // Find the selected book object for additional info
    const selectedBookObj = books.find((book) => book.book_Id === bookId);
    console.log("Selected book object:", selectedBookObj); // Debug log

    setSelectedBook(bookId);
  };

  // Fetch books for menu with better error handling
  React.useEffect(() => {
    console.log("Fetching books..."); // Debug log
    api
      .get("/Book/search")
      .then((res) => {
        console.log("Books fetched:", res.data); // Debug log
        setBooks(res.data || []);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
        setBooks([]);
        setSnackbar({
          open: true,
          message: "Failed to fetch books.",
          severity: "error",
        });
      });
  }, []);

  // Fetch chapters for selected book
  const fetchChapters = React.useCallback(() => {
    if (!selectedBook) {
      console.log("No book selected, clearing chapters");
      setChapters([]);
      return;
    }

    console.log("Fetching chapters for book ID:", selectedBook);
    setLoading(true);

    api
      .get(`/Chapter/book/${selectedBook}`) // changed from /Chapter/search?bookId=...
      .then((res) => {
        console.log("Chapters fetched for book", selectedBook, ":", res.data);
        setChapters(Array.isArray(res.data) ? res.data : []);
      })
      .catch((error) => {
        console.error(
          "Error fetching chapters for book",
          selectedBook,
          ":",
          error
        );
        setChapters([]);
        setSnackbar({
          open: true,
          message: "Failed to fetch chapters.",
          severity: "error",
        });
      })
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
    console.log("Editing chapter:", chapter);
    console.log("Current selectedBook:", selectedBook);
    console.log("Chapter's book_Id:", chapter.book_Id);

    // Validate that we have a selected book and chapter
    if (!selectedBook || !chapter.chapter_Id) {
      setSnackbar({
        open: true,
        message: "Invalid chapter or book selection. Please try again.",
        severity: "error",
      });
      return;
    }

    setEditChapter(chapter);
    setEditValues({
      chapter_Title: chapter.chapter_Title || "",
      status: chapter.status || "",
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
      // Get the chapter title and validate it
      const trimmedTitle = editValues.chapter_Title.trim();

      if (!trimmedTitle) {
        setSnackbar({
          open: true,
          message: "Chapter title cannot be empty.",
          severity: "error",
        });
        return;
      }

      if (trimmedTitle.length < 2) {
        setSnackbar({
          open: true,
          message: "Chapter title must be at least 2 characters long.",
          severity: "error",
        });
        return;
      }

      // Use selectedBook instead of editChapter.book_Id
      const updateData = {
        book_Id: selectedBook, // Use the currently selected book ID
        chapter_Title: trimmedTitle,
        isActive: true,
        status: "Pending",
        rejectionReason: "", // Empty string, not null
      };

      console.log(
        "Sending update request to:",
        `/Chapter/${editChapter.chapter_Id}`
      );
      console.log("Update data:", updateData);
      console.log(
        "Using selectedBook:",
        selectedBook,
        "instead of editChapter.book_Id:",
        editChapter.book_Id
      );

      const response = await api.put(
        `/Chapter/${editChapter.chapter_Id}`,
        updateData
      );
      console.log("Update response:", response.data);

      setSnackbar({
        open: true,
        message: "Chapter updated successfully.",
        severity: "success",
      });
      setEditOpen(false);
      fetchChapters();
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);

      let errorMessage = "Failed to update chapter.";

      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }

      setSnackbar({
        open: true,
        message: `${errorMessage} (Status: ${
          error.response?.status || "Unknown"
        })`,
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
    if (statusValue === "Rejected" && !statusReason.trim()) {
      setSnackbar({
        open: true,
        message: "Rejection reason is required when status is Rejected.",
        severity: "error",
      });
      return;
    }

    try {
      // Try dedicated status endpoint first
      let statusData = {
        status: statusValue,
        rejectionReason: statusValue === "Rejected" ? statusReason.trim() : "",
      };

      try {
        await api.put(
          `/Chapter/${statusChapter.chapter_Id}/status`,
          statusData
        );
      } catch (statusError) {
        // If status endpoint doesn't exist, try full update
        if (statusError.response?.status === 404) {
          const fullUpdateData = {
            book_Id: selectedBook, // Use selectedBook instead of statusChapter.book_Id
            chapter_Title: statusChapter.chapter_Title,
            isActive: statusChapter.isActive,
            status: statusValue,
            rejectionReason:
              statusValue === "Rejected" ? statusReason.trim() : "",
          };
          await api.put(`/Chapter/${statusChapter.chapter_Id}`, fullUpdateData);
        } else {
          throw statusError;
        }
      }

      setSnackbar({
        open: true,
        message: "Status updated successfully.",
        severity: "success",
      });
      setStatusDialogOpen(false);
      setStatusValue("");
      setStatusReason("");
      fetchChapters();
    } catch (error) {
      console.error("Error updating status:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to update status.",
        severity: "error",
      });
    }
  };

  const handleCreateOpen = () => {
    setCreateTitle("");
    setCreateOpen(true);
  };

  const handleCreateClose = () => {
    setCreateOpen(false);
    setCreateTitle("");
  };

  // Enhanced create submit with book ID validation
  const handleCreateSubmit = async () => {
    const title = createTitle.trim();

    // Validate book selection
    if (!selectedBook) {
      setSnackbar({
        open: true,
        message: "Please select a book first.",
        severity: "error",
      });
      return;
    }

    if (!title) {
      setSnackbar({
        open: true,
        message: "Please enter a chapter title.",
        severity: "error",
      });
      return;
    }

    if (title.length < 2) {
      setSnackbar({
        open: true,
        message: "Chapter title must be at least 2 characters long.",
        severity: "error",
      });
      return;
    }

    try {
      const createData = {
        book_Id: selectedBook, // This is the book ID from the dropdown
        chapter_Title: title,
        isActive: true,
        status: "Pending",
        rejectionReason: "",
      };

      console.log("Creating chapter with book ID:", selectedBook);
      console.log("Create data:", createData);

      const response = await api.post("/Chapter", createData);
      console.log("Create response:", response.data);

      setSnackbar({
        open: true,
        message: "Chapter created successfully.",
        severity: "success",
      });
      setCreateOpen(false);
      setCreateTitle("");
      fetchChapters();
    } catch (error) {
      console.error("Error creating chapter:", error);
      console.error("Error response data:", error.response?.data);

      let errorMessage = "Failed to create chapter.";

      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      setSnackbar({
        open: true,
        message: `${errorMessage} (Status: ${
          error.response?.status || "Unknown"
        })`,
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
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FormControl sx={{ minWidth: 300, mr: 2 }}>
          <InputLabel id="book-select-label">Choose Book</InputLabel>
          <Select
            labelId="book-select-label"
            value={selectedBook}
            label="Choose Book"
            onChange={handleBookChange} // Use the enhanced handler
          >
            {books.map((book) => (
              <MenuItem key={book.book_Id} value={book.book_Id}>
                {book.book_Title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Show selected book info for debugging */}
        {selectedBook && (
          <Typography variant="body2" sx={{ mr: 2, color: "text.secondary" }}>
            Selected Book ID: {selectedBook}
          </Typography>
        )}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleCreateOpen}
          disabled={!selectedBook}
        >
          Create
        </Button>
      </Box>
      {/* Show book selection status */}
      {!selectedBook && (
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Please select a book to view its chapters.
        </Typography>
      )}
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
      {/* Create Dialog */}
      <Dialog
        open={createOpen}
        onClose={handleCreateClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create Chapter</DialogTitle>
        <DialogContent>
          <TextField
            label="Chapter Title"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
            fullWidth
            autoFocus
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
