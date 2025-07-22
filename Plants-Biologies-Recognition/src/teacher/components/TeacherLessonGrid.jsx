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
import RichTextEditor from "../../admin/components/RichTextEditor";
import { storage } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";

const columnsBase = (handleDelete, handleEdit, handleContentClick) => [
  { field: "lesson_Id", headerName: "ID", width: 220 },
  { field: "lesson_Title", headerName: "Title", width: 220 },
  {
    field: "content",
    headerName: "Content",
    width: 300,
    renderCell: (params) => (
      <Button
        variant="text"
        onClick={() => handleContentClick(params.row)}
        sx={{
          textTransform: "none",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 260,
        }}
      >
        View Content
      </Button>
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
        sx={{ cursor: "default" }} // read-only for teacher
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
        onClick={() => handleDelete(params.row.lesson_Id)}
      >
        <DeleteIcon />
      </IconButton>
    ),
  },
];

export default function LessonGrid() {
  const [lessons, setLessons] = React.useState([]);
  const [books, setBooks] = React.useState([]);
  const [chapters, setChapters] = React.useState([]);
  const [selectedBook, setSelectedBook] = React.useState("");
  const [selectedChapter, setSelectedChapter] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Edit dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editLesson, setEditLesson] = React.useState(null);
  const [editValues, setEditValues] = React.useState({
    lesson_Title: "",
    status: "",
    rejectionReason: "",
  });
  const [editContent, setEditContent] = React.useState("");

  // Content dialog state
  const [contentDialogOpen, setContentDialogOpen] = React.useState(false);
  const [contentDialogLesson, setContentDialogLesson] = React.useState(null);
  const [contentDialogHtml, setContentDialogHtml] = React.useState("");
  const [contentDialogLoading, setContentDialogLoading] = React.useState(false);

  // Create dialog state
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createTitle, setCreateTitle] = React.useState("");

  // Fetch books for menu with better error handling
  React.useEffect(() => {
    api
      .get("/Book/search")
      .then((res) => {
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

  // Fetch chapters for selected book with better error handling
  React.useEffect(() => {
    if (!selectedBook) {
      setChapters([]);
      setSelectedChapter("");
      return;
    }
    api
      .get(`/Chapter/book/${selectedBook}`)
      .then((res) => {
        setChapters(Array.isArray(res.data) ? res.data : []);
      })
      .catch((error) => {
        console.error("Error fetching chapters:", error);
        setChapters([]);
        setSnackbar({
          open: true,
          message: "Failed to fetch chapters.",
          severity: "error",
        });
      });
  }, [selectedBook]);

  // Fetch lessons for selected chapter with better error handling
  const fetchLessons = React.useCallback(() => {
    if (!selectedChapter) {
      setLessons([]);
      return;
    }
    setLoading(true);
    api
      .get(`/Lesson/chapter/${selectedChapter}`)
      .then((res) => {
        setLessons(Array.isArray(res.data) ? res.data : []);
      })
      .catch((error) => {
        console.error("Error fetching lessons:", error);
        setLessons([]);
        setSnackbar({
          open: true,
          message: "Failed to fetch lessons.",
          severity: "error",
        });
      })
      .finally(() => setLoading(false));
  }, [selectedChapter]);

  React.useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // CRUD handlers
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await api.delete(`/Lesson/${id}`);
      setSnackbar({
        open: true,
        message: "Lesson deleted successfully.",
        severity: "success",
      });
      fetchLessons();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to delete lesson.",
        severity: "error",
      });
    }
  };

  const handleEdit = async (lesson) => {
    setEditLesson(lesson);
    setEditValues({
      lesson_Title: lesson.lesson_Title,
      status: lesson.status,
      rejectionReason: lesson.rejectionReason || "",
    });

    // If content is a Firebase Storage URL, fetch the HTML
    if (lesson.content && lesson.content.startsWith("http")) {
      try {
        const res = await fetch(lesson.content);
        const html = await res.text();
        setEditContent(html);
      } catch {
        setEditContent("<i>Failed to load content.</i>");
      }
    } else {
      setEditContent(lesson.content || "");
    }

    setEditOpen(true);
  };

  // Handle changes in the edit dialog's text fields
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Upload content HTML to Firebase and return URL
  const uploadContentToFirebase = async (html, lessonId) => {
    const blob = new Blob([html], { type: "text/html" });
    const storageRef = ref(storage, `lessons/${lessonId}/content.html`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleEditSubmit = async () => {
    try {
      let contentUrl = editLesson.content;

      // Always upload new content if changed
      if (editContent !== editLesson.content) {
        contentUrl = await uploadContentToFirebase(
          editContent,
          editLesson.lesson_Id
        );
      }

      // Match the API documentation structure exactly
      const updateData = {
        chapter_Id: editLesson.chapter_Id, // Required field
        lesson_Title: editValues.lesson_Title,
        content: contentUrl || "", // Ensure content is never null
        isActive: editLesson.isActive, // Preserve existing value
        status: "Pending", // Reset to pending when editing
        rejectionReason: "", // Clear rejection reason when editing
      };

      await api.put(`/Lesson/${editLesson.lesson_Id}`, updateData);

      setSnackbar({
        open: true,
        message: "Lesson updated successfully.",
        severity: "success",
      });
      setEditOpen(false);
      fetchLessons();
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to update lesson.",
        severity: "error",
      });
    }
  };

  // Create handlers
  const handleCreateOpen = () => {
    setCreateTitle("");
    setCreateOpen(true);
  };

  const handleCreateClose = () => {
    setCreateOpen(false);
    setCreateTitle("");
  };

  // Create lesson with validation
  const handleCreateSubmit = async () => {
    const title = createTitle.trim();

    if (!title || !selectedChapter) {
      setSnackbar({
        open: true,
        message: "Please select a chapter and enter a lesson title.",
        severity: "error",
      });
      return;
    }

    if (title.length < 2) {
      setSnackbar({
        open: true,
        message: "Lesson title must be at least 2 characters long.",
        severity: "error",
      });
      return;
    }

    try {
      const createData = {
        chapter_Id: selectedChapter,
        lesson_Title: title,
        content: "", // Empty content initially
        isActive: false,
        status: "Pending",
        rejectionReason: "",
      };

      await api.post("/Lesson", createData);
      setSnackbar({
        open: true,
        message: "Lesson created successfully.",
        severity: "success",
      });
      setCreateOpen(false);
      setCreateTitle("");
      fetchLessons();
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to create lesson.",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditLesson(null);
    setEditValues({
      lesson_Title: "",
      status: "",
      rejectionReason: "",
    });
  };

  const handleContentClick = async (lesson) => {
    setContentDialogLesson(lesson);
    setContentDialogHtml("");
    setContentDialogLoading(true);
    // If content is a Firebase Storage URL, fetch the HTML
    if (lesson.content && lesson.content.startsWith("http")) {
      try {
        const res = await fetch(lesson.content);
        const html = await res.text();
        setContentDialogHtml(html);
      } catch {
        setContentDialogHtml("<i>Failed to load content.</i>");
      }
    } else {
      setContentDialogHtml(lesson.content || "<i>No content</i>");
    }
    setContentDialogLoading(false);
    setContentDialogOpen(true);
  };

  const handleContentDialogClose = () => {
    setContentDialogOpen(false);
    setContentDialogLesson(null);
    setContentDialogHtml("");
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Lesson Management
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FormControl sx={{ minWidth: 300, mr: 2 }}>
          <InputLabel id="book-select-label">Choose Book</InputLabel>
          <Select
            labelId="book-select-label"
            value={selectedBook}
            label="Choose Book"
            onChange={(e) => {
              setSelectedBook(e.target.value);
              setSelectedChapter("");
            }}
          >
            {books.map((book) => (
              <MenuItem key={book.book_Id} value={book.book_Id}>
                {book.book_Title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 300, mr: 2 }}>
          <InputLabel id="chapter-select-label">Choose Chapter</InputLabel>
          <Select
            labelId="chapter-select-label"
            value={selectedChapter}
            label="Choose Chapter"
            onChange={(e) => setSelectedChapter(e.target.value)}
            disabled={!selectedBook}
          >
            {chapters.map((chapter) => (
              <MenuItem key={chapter.chapter_Id} value={chapter.chapter_Id}>
                {chapter.chapter_Title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleCreateOpen}
          disabled={!selectedChapter}
        >
          Create
        </Button>
      </Box>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={lessons}
          columns={columnsBase(handleDelete, handleEdit, handleContentClick)}
          getRowId={(row) => row.lesson_Id}
          loading={loading}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          autoHeight
        />
      </Box>
      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Lesson</DialogTitle>
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
            name="lesson_Title"
            value={editValues.lesson_Title}
            onChange={handleEditChange}
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
          />
          <RichTextEditor value={editContent} onChange={setEditContent} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Content Dialog */}
      <Dialog
        open={contentDialogOpen}
        onClose={handleContentDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {contentDialogLesson?.lesson_Title || "Lesson Content"}
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: 200 }}>
          {contentDialogLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 100,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <div
              style={{ maxHeight: 400, overflow: "auto" }}
              dangerouslySetInnerHTML={{ __html: contentDialogHtml }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleContentDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Create Dialog */}
      <Dialog
        open={createOpen}
        onClose={handleCreateClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Lesson</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Lesson Title"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose}>Cancel</Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            disabled={!createTitle}
          >
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
